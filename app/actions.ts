'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ServerStatus } from '@prisma/client';
import { cookies } from 'next/headers';
import { signJWT, verifyJWT } from '@/lib/auth';
import crypto from 'crypto';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function fixSequence(tableName: string) {
  try {
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"${tableName}"', 'id'), COALESCE((SELECT MAX(id) FROM "${tableName}"), 0) + 1, false);`
    );
  } catch (e) {
    // Ignore error if unsupported
  }
}

async function safeCreate<T>(tableName: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (error?.code === 'P2002' || error?.message?.includes('Unique constraint')) {
      await fixSequence(tableName);
      return await fn();
    }
    throw error;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;

  const session = await verifyJWT(token);
  if (!session || !session.user) return null;

  return await prisma.user.findUnique({
    where: { username: session.user as string },
  });
}

// ============================================================================
// ROOM ACTIONS
// ============================================================================

export async function createRoom(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const name = formData.get('name') as string;
  const tempThresholdC = parseFloat(formData.get('tempThresholdC') as string);

  if (!name || isNaN(tempThresholdC)) {
    throw new Error('Invalid input data');
  }

  await safeCreate('Room', () =>
    prisma.room.create({
      data: {
        name,
        tempThresholdC,
        userId: user.id,
      },
    })
  );

  revalidatePath('/rooms');
  revalidatePath('/');
}

export async function updateRoom(id: number, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const name = formData.get('name') as string;
  const tempThresholdC = parseFloat(formData.get('tempThresholdC') as string);

  if (!name || isNaN(tempThresholdC)) {
    throw new Error('Invalid input data');
  }

  const room = await prisma.room.findFirst({ where: { id, userId: user.id } });
  if (!room) throw new Error('Unauthorized');

  await prisma.room.update({
    where: { id },
    data: {
      name,
      tempThresholdC,
    },
  });

  revalidatePath(`/rooms`);
  revalidatePath(`/rooms/${id}`);
  revalidatePath('/');
}

export async function deleteRoom(id: number) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const room = await prisma.room.findFirst({ where: { id, userId: user.id } });
  if (!room) throw new Error('Unauthorized');

  // First delete associated readings, servers, and racks
  const racks = await prisma.rack.findMany({ where: { roomId: id } });
  for (const rack of racks) {
    const servers = await prisma.server.findMany({ where: { rackId: rack.id } });
    for (const server of servers) {
      await prisma.powerReading.deleteMany({ where: { serverId: server.id } });
    }
    await prisma.server.deleteMany({ where: { rackId: rack.id } });
  }
  await prisma.rack.deleteMany({ where: { roomId: id } });
  await prisma.room.delete({ where: { id } });

  revalidatePath('/rooms');
  revalidatePath('/');
}

// ============================================================================
// RACK ACTIONS
// ============================================================================

export async function createRack(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const roomId = parseInt(formData.get('roomId') as string);
  const name = formData.get('name') as string;
  const totalUnits = parseInt(formData.get('totalUnits') as string) || 42;
  const powerLimitWatts = parseFloat(formData.get('powerLimitWatts') as string);

  if (isNaN(roomId) || !name || isNaN(powerLimitWatts)) {
    throw new Error('Invalid input data');
  }

  const room = await prisma.room.findFirst({ where: { id: roomId, userId: user.id } });
  if (!room) throw new Error('Unauthorized');

  await safeCreate('Rack', () =>
    prisma.rack.create({
      data: {
        roomId,
        name,
        totalUnits,
        powerLimitWatts,
      },
    })
  );

  revalidatePath(`/rooms/${roomId}`);
  revalidatePath('/');
}

export async function updateRack(id: number, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const name = formData.get('name') as string;
  const totalUnits = parseInt(formData.get('totalUnits') as string) || 42;
  const powerLimitWatts = parseFloat(formData.get('powerLimitWatts') as string);

  if (!name || isNaN(powerLimitWatts)) {
    throw new Error('Invalid input data');
  }

  const rack = await prisma.rack.findFirst({ where: { id, room: { userId: user.id } } });
  if (!rack) throw new Error('Unauthorized');

  await prisma.rack.update({
    where: { id },
    data: {
      name,
      totalUnits,
      powerLimitWatts,
    },
  });

  revalidatePath(`/rooms/${rack.roomId}`);
  revalidatePath(`/racks/${id}`);
  revalidatePath('/');
}

export async function deleteRack(id: number) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const rack = await prisma.rack.findFirst({ where: { id, room: { userId: user.id } } });
  if (!rack) throw new Error('Unauthorized');

  const servers = await prisma.server.findMany({ where: { rackId: id } });
  for (const server of servers) {
    await prisma.powerReading.deleteMany({ where: { serverId: server.id } });
  }
  await prisma.server.deleteMany({ where: { rackId: id } });
  await prisma.rack.delete({ where: { id } });

  revalidatePath(`/rooms/${rack.roomId}`);
  revalidatePath('/');
}

// ============================================================================
// SERVER ACTIONS
// ============================================================================

// Helper to check for slot overlap conflicts
async function checkOverlap(
  rackId: number,
  startUnit: number,
  sizeUnits: number,
  excludeServerId?: number
) {
  const rack = await prisma.rack.findUnique({
    where: { id: rackId },
    include: { servers: true },
  });

  if (!rack) throw new Error('Rack not found');

  // Boundaries check
  const endUnit = startUnit + sizeUnits - 1;
  if (startUnit < 1 || endUnit > rack.totalUnits) {
    throw new Error(`Server exceeds rack capacity of ${rack.totalUnits} U.`);
  }

  // Overlap check
  for (const server of rack.servers) {
    if (excludeServerId && server.id === excludeServerId) continue;

    const sStart = server.startUnit;
    const sEnd = server.startUnit + server.sizeUnits - 1;

    // If ranges overlap
    if (startUnit <= sEnd && endUnit >= sStart) {
      return server; // return conflicting server
    }
  }

  return null;
}

export async function createServer(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const rackId = parseInt(formData.get('rackId') as string);
  const name = formData.get('name') as string;
  const startUnit = parseInt(formData.get('startUnit') as string);
  const sizeUnits = parseInt(formData.get('sizeUnits') as string);
  const status = formData.get('status') as ServerStatus;

  if (isNaN(rackId) || !name || isNaN(startUnit) || isNaN(sizeUnits) || !status) {
    throw new Error('Invalid input data');
  }

  const rack = await prisma.rack.findFirst({ where: { id: rackId, room: { userId: user.id } } });
  if (!rack) throw new Error('Unauthorized');

  // Check overlap
  const conflict = await checkOverlap(rackId, startUnit, sizeUnits);
  if (conflict) {
    throw new Error(`Slot conflict: U${startUnit}-${startUnit + sizeUnits - 1} is already occupied by server "${conflict.name}"`);
  }

  const server = await safeCreate('Server', () =>
    prisma.server.create({
      data: {
        rackId,
        name,
        startUnit,
        sizeUnits,
        status,
      },
    })
  );

  revalidatePath(`/racks/${rackId}`);
  revalidatePath('/');
  return server;
}

export async function updateServer(id: number, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const name = formData.get('name') as string;
  const startUnit = parseInt(formData.get('startUnit') as string);
  const sizeUnits = parseInt(formData.get('sizeUnits') as string);
  const status = formData.get('status') as ServerStatus;

  if (!name || isNaN(startUnit) || isNaN(sizeUnits) || !status) {
    throw new Error('Invalid input data');
  }

  const currentServer = await prisma.server.findFirst({
    where: { id, rack: { room: { userId: user.id } } }
  });
  if (!currentServer) throw new Error('Unauthorized');

  // Check overlap
  const conflict = await checkOverlap(currentServer.rackId, startUnit, sizeUnits, id);
  if (conflict) {
    throw new Error(`Slot conflict: U${startUnit}-${startUnit + sizeUnits - 1} is already occupied by server "${conflict.name}"`);
  }

  await prisma.server.update({
    where: { id },
    data: {
      name,
      startUnit,
      sizeUnits,
      status,
    },
  });

  revalidatePath(`/racks/${currentServer.rackId}`);
  revalidatePath('/');
}

export async function deleteServer(id: number) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const server = await prisma.server.findFirst({
    where: { id, rack: { room: { userId: user.id } } }
  });
  if (!server) throw new Error('Unauthorized');

  await prisma.powerReading.deleteMany({ where: { serverId: id } });
  await prisma.server.delete({ where: { id } });

  revalidatePath(`/racks/${server.rackId}`);
  revalidatePath('/');
}

// ============================================================================
// AUTH ACTIONS
// ============================================================================

export async function loginAdmin(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    throw new Error('Please fill in all fields');
  }

  // 1. Check against environment fallback credentials first
  const expectedUsername = process.env.ADMIN_USERNAME || 'admin';
  const expectedPassword = process.env.ADMIN_PASSWORD || 'adminpassword';

  if (username === expectedUsername && password === expectedPassword) {
    // Authenticated via env fallback - ensure user exists in DB
    const dbUser = await prisma.user.findUnique({ where: { username } });
    if (!dbUser) {
      const hashedEnvPassword = hashPassword(expectedPassword);
      await safeCreate('User', () =>
        prisma.user.create({
          data: {
            username,
            password: hashedEnvPassword,
          },
        })
      );
    }
  } else {
    // 2. Check against database users
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new Error('Invalid username or password');
    }

    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      throw new Error('Invalid username or password');
    }
  }

  const token = await signJWT({ role: 'admin', user: username });

  const cookieStore = await cookies();
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });

  revalidatePath('/');
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  revalidatePath('/');
  redirect('/login');
}

export async function createAdminUser(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!username || !password || !confirmPassword) {
    throw new Error('All fields are required');
  }

  if (password !== confirmPassword) {
    throw new Error('Passwords do not match');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    throw new Error('Username already exists');
  }

  const hashedPassword = hashPassword(password);
  await safeCreate('User', () =>
    prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    })
  );

  revalidatePath('/settings');
}

export async function changeAdminPassword(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) throw new Error('Unauthorized');

  const session = await verifyJWT(token);
  if (!session || !session.user) throw new Error('Unauthorized');

  const currentUsername = session.user as string;
  const currentPassword = formData.get('currentPassword') as string;
  const newUsername = formData.get('newUsername') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmNewPassword = formData.get('confirmNewPassword') as string;

  if (!currentPassword || !newUsername || !newPassword || !confirmNewPassword) {
    throw new Error('All fields are required');
  }

  if (newPassword !== confirmNewPassword) {
    throw new Error('New passwords do not match');
  }

  if (newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters');
  }

  // Find user in database
  let user = await prisma.user.findUnique({
    where: { username: currentUsername },
  });

  // If user is not in database, check if it's the env fallback admin
  if (!user && currentUsername === (process.env.ADMIN_USERNAME || 'admin')) {
    const expectedPassword = process.env.ADMIN_PASSWORD || 'adminpassword';
    if (currentPassword !== expectedPassword) {
      throw new Error('Incorrect current password');
    }

    // Create the record in the database first
    const hashedEnvPassword = hashPassword(expectedPassword);
    user = await prisma.user.create({
      data: {
        username: currentUsername,
        password: hashedEnvPassword,
      },
    });
  }

  if (!user) {
    throw new Error('Incorrect current password');
  }

  // Verify current password against database record
  const hashedCurrent = hashPassword(currentPassword);
  if (user.password !== hashedCurrent) {
    throw new Error('Incorrect current password');
  }

  // Update username and password in database
  const hashedNewPassword = hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      username: newUsername,
      password: hashedNewPassword,
    },
  });

  const newToken = await signJWT({ role: 'admin', user: newUsername });
  cookieStore.set('token', newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });

  revalidatePath('/');
  revalidatePath('/settings');
}
