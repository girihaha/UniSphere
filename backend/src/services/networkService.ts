import { prisma } from "../lib/prisma";

export type RelationshipStatus = "connected" | "request_sent" | "you" | "none";

function getRelativeTime(timestamp: Date | string) {
  const createdAt = new Date(timestamp).getTime();
  const diffMs = Date.now() - createdAt;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

function formatRelativeTime(timestamp: Date | string) {
  return getRelativeTime(timestamp);
}

function getDisplayRole(role: string) {
  if (role === "super_admin") return "Super Admin";
  if (role === "club_admin") return "Club Admin";
  return "Student";
}

function normalizeConnectionPair(userAId: string, userBId: string) {
  return userAId < userBId
    ? { userAId, userBId }
    : { userAId: userBId, userBId: userAId };
}

async function getUserBasicById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      socialLinks: true,
    },
  });
}

async function getConnectedUserIds(userId: string): Promise<string[]> {
  const rows = await prisma.networkConnection.findMany({
    where: {
      OR: [{ userAId: userId }, { userBId: userId }],
    },
  });

  return rows.map((row) => (row.userAId === userId ? row.userBId : row.userAId));
}

async function createNotificationRecord(params: {
  userId: string;
  type: string;
  message: string;
  actorId: string;
  actorName: string;
  actorRole?: string | null;
  actionState?: string | null;
  postId?: number | null;
  postTitle?: string | null;
}) {
  await prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      message: params.message,
      actorId: params.actorId,
      actorName: params.actorName,
      actorRole: params.actorRole || null,
      read: false,
      timestamp: "Just now",
      timestampMs: BigInt(Date.now()),
      actionState: params.actionState || null,
      postId: params.postId ?? null,
      postTitle: params.postTitle ?? null,
    },
  });
}

async function notifyConnectionRequest(
  fromUserId: string,
  toUserId: string,
  message?: string
) {
  const sender = await prisma.user.findUnique({
    where: { id: fromUserId },
  });

  if (!sender) return;

  await createNotificationRecord({
    userId: toUserId,
    type: "connection_request",
    message: message?.trim()
      ? `${sender.name} sent you a connection request: "${message.trim()}"`
      : `${sender.name} sent you a connection request.`,
    actorId: sender.id,
    actorName: sender.name,
    actorRole: getDisplayRole(sender.role),
    actionState: "pending",
  });
}

async function notifyConnectionAccepted(currentUserId: string, requesterId: string) {
  const accepter = await prisma.user.findUnique({
    where: { id: currentUserId },
  });

  if (!accepter) return;

  await createNotificationRecord({
    userId: requesterId,
    type: "interaction",
    message: `${accepter.name} accepted your connection request.`,
    actorId: accepter.id,
    actorName: accepter.name,
    actorRole: getDisplayRole(accepter.role),
  });
}

async function notifyNetworkNoteCreated(authorId: string, noteText: string) {
  const author = await prisma.user.findUnique({
    where: { id: authorId },
  });

  if (!author) return;

  const connectedUserIds = await getConnectedUserIds(authorId);

  if (!connectedUserIds.length) return;

  await prisma.notification.createMany({
    data: connectedUserIds.map((targetUserId) => ({
      userId: targetUserId,
      type: "network_note",
      message: `${author.name} posted a new network note.`,
      actorId: author.id,
      actorName: author.name,
      actorRole: getDisplayRole(author.role),
      read: false,
      timestamp: "Just now",
      timestampMs: BigInt(Date.now()),
      actionState: null,
      postId: null,
      postTitle: noteText.length > 100 ? `${noteText.slice(0, 100)}...` : noteText,
    })),
  });
}

export async function getMutualCount(userA: string, userB: string): Promise<number> {
  const [aConnections, bConnections] = await Promise.all([
    getConnectedUserIds(userA),
    getConnectedUserIds(userB),
  ]);

  const aSet = new Set(aConnections);
  let count = 0;

  for (const id of bConnections) {
    if (aSet.has(id)) count++;
  }

  return count;
}

export async function isConnected(userA: string, userB: string): Promise<boolean> {
  const pair = normalizeConnectionPair(userA, userB);

  const connection = await prisma.networkConnection.findFirst({
    where: {
      userAId: pair.userAId,
      userBId: pair.userBId,
    },
  });

  return !!connection;
}

export async function findPendingRequest(fromUserId: string, toUserId: string) {
  return prisma.connectionRequest.findUnique({
    where: {
      fromUserId_toUserId: {
        fromUserId,
        toUserId,
      },
    },
  });
}

export async function hasPendingRequest(
  fromUserId: string,
  toUserId: string
): Promise<boolean> {
  return !!(await findPendingRequest(fromUserId, toUserId));
}

export async function hasAnyPendingRequestBetween(
  userA: string,
  userB: string
): Promise<boolean> {
  const request = await prisma.connectionRequest.findFirst({
    where: {
      OR: [
        { fromUserId: userA, toUserId: userB },
        { fromUserId: userB, toUserId: userA },
      ],
    },
  });

  return !!request;
}

async function removePendingRequestsBetween(userA: string, userB: string) {
  await prisma.connectionRequest.deleteMany({
    where: {
      OR: [
        { fromUserId: userA, toUserId: userB },
        { fromUserId: userB, toUserId: userA },
      ],
    },
  });
}

export async function getRelationshipStatus(
  currentUserId: string,
  targetUserId: string
): Promise<RelationshipStatus> {
  if (currentUserId === targetUserId) {
    return "you";
  }

  if (await isConnected(currentUserId, targetUserId)) {
    return "connected";
  }

  if (await hasPendingRequest(currentUserId, targetUserId)) {
    return "request_sent";
  }

  return "none";
}

export async function getConnectionCount(userId: string): Promise<number> {
  const rows = await prisma.networkConnection.count({
    where: {
      OR: [{ userAId: userId }, { userBId: userId }],
    },
  });

  return rows;
}

export async function getDiscoverUsers(currentUserId: string) {
  const [users, connectedIds, pendingSentRows, pendingReceivedRows] = await Promise.all([
    prisma.user.findMany({
      where: {
        id: {
          not: currentUserId,
        },
      },
      include: {
        socialLinks: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    getConnectedUserIds(currentUserId),
    prisma.connectionRequest.findMany({
      where: {
        fromUserId: currentUserId,
      },
      select: {
        toUserId: true,
      },
    }),
    prisma.connectionRequest.findMany({
      where: {
        toUserId: currentUserId,
      },
      select: {
        fromUserId: true,
      },
    }),
  ]);

  const connectedSet = new Set(connectedIds);
  const pendingSentSet = new Set(pendingSentRows.map((row) => row.toUserId));
  const pendingReceivedSet = new Set(pendingReceivedRows.map((row) => row.fromUserId));

  const filteredUsers = users.filter((user) => !connectedSet.has(user.id));

  return Promise.all(
    filteredUsers.map(async (user) => ({
      id: user.id,
      name: user.name,
      branch: user.branch,
      degree: "B.Tech",
      year: user.year,
      mutual: await getMutualCount(currentUserId, user.id),
      avatar: user.avatarUrl || "",
      requestSent: pendingSentSet.has(user.id),
      hasIncomingRequest: pendingReceivedSet.has(user.id),
    }))
  );
}

export async function getConnectionsForUser(currentUserId: string) {
  const connectedIds = await getConnectedUserIds(currentUserId);

  if (!connectedIds.length) {
    return [];
  }

  const users = await prisma.user.findMany({
    where: {
      id: {
        in: connectedIds,
      },
    },
    include: {
      socialLinks: true,
    },
  });

  return Promise.all(
    users.map(async (user) => ({
      id: user.id,
      name: user.name,
      branch: user.branch,
      degree: "B.Tech",
      year: user.year,
      online: true,
      mutual: await getMutualCount(currentUserId, user.id),
      avatar: user.avatarUrl || "",
      instagram: user.socialLinks.find((s) => s.type === "instagram")?.handle,
      linkedin: user.socialLinks.find((s) => s.type === "linkedin")?.handle,
      github: user.socialLinks.find((s) => s.type === "github")?.handle,
      portfolio: user.socialLinks.find((s) => s.type === "portfolio")?.handle,
    }))
  );
}

export async function getIncomingRequestsForUser(currentUserId: string) {
  const requests = await prisma.connectionRequest.findMany({
    where: {
      toUserId: currentUserId,
    },
    include: {
      fromUser: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return Promise.all(
    requests.map(async (req) => ({
      id: req.fromUser.id,
      name: req.fromUser.name,
      branch: req.fromUser.branch,
      degree: "B.Tech",
      year: req.fromUser.year,
      mutual: await getMutualCount(currentUserId, req.fromUser.id),
      avatar: req.fromUser.avatarUrl || "",
      message: req.message || "",
      time: formatRelativeTime(req.createdAt),
    }))
  );
}

export async function sendConnectionRequest(
  fromUserId: string,
  toUserId: string,
  message?: string
): Promise<{ error?: string }> {
  if (!fromUserId || !toUserId) {
    return { error: "Invalid user id." };
  }

  if (fromUserId === toUserId) {
    return { error: "You cannot connect with yourself." };
  }

  const [sender, target] = await Promise.all([
    getUserBasicById(fromUserId),
    getUserBasicById(toUserId),
  ]);

  if (!sender) {
    return { error: "Sender not found." };
  }

  if (!target) {
    return { error: "User not found." };
  }

  if (await isConnected(fromUserId, toUserId)) {
    return { error: "Already connected." };
  }

  if (await hasPendingRequest(fromUserId, toUserId)) {
    return { error: "Request already sent." };
  }

  if (await hasPendingRequest(toUserId, fromUserId)) {
    return {
      error: "This user has already sent you a request. Accept it from requests.",
    };
  }

  await prisma.connectionRequest.create({
    data: {
      fromUserId,
      toUserId,
      message: typeof message === "string" && message.trim() ? message.trim() : null,
    },
  });

  await notifyConnectionRequest(fromUserId, toUserId, message);

  return {};
}

export async function acceptConnectionRequest(
  currentUserId: string,
  requesterId: string
): Promise<{ error?: string }> {
  const [currentUser, requester] = await Promise.all([
    prisma.user.findUnique({ where: { id: currentUserId } }),
    prisma.user.findUnique({ where: { id: requesterId } }),
  ]);

  if (!currentUser || !requester) {
    return { error: "User not found." };
  }

  const pending = await findPendingRequest(requesterId, currentUserId);

  if (!pending) {
    return { error: "Request not found." };
  }

  const pair = normalizeConnectionPair(currentUserId, requesterId);

  await prisma.$transaction(async (tx) => {
    await tx.networkConnection.upsert({
      where: {
        userAId_userBId: {
          userAId: pair.userAId,
          userBId: pair.userBId,
        },
      },
      update: {},
      create: {
        userAId: pair.userAId,
        userBId: pair.userBId,
      },
    });

    await tx.connectionRequest.deleteMany({
      where: {
        OR: [
          { fromUserId: currentUserId, toUserId: requesterId },
          { fromUserId: requesterId, toUserId: currentUserId },
        ],
      },
    });
  });

  await notifyConnectionAccepted(currentUserId, requesterId);

  return {};
}

export async function rejectConnectionRequest(
  currentUserId: string,
  requesterId: string
): Promise<{ error?: string }> {
  const pending = await findPendingRequest(requesterId, currentUserId);

  if (!pending) {
    return { error: "Request not found." };
  }

  await removePendingRequestsBetween(currentUserId, requesterId);

  return {};
}

export async function getNetworkNotesForUser(currentUserId: string) {
  const connectedIds = await getConnectedUserIds(currentUserId);
  const allowedAuthorIds = [currentUserId, ...connectedIds];

  const notes = await prisma.networkNote.findMany({
    where: {
      authorId: {
        in: allowedAuthorIds,
      },
    },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return notes.map((note) => ({
    id: note.id,
    authorId: note.authorId,
    authorName: note.user.name,
    authorBranch: note.user.branch,
    avatar: note.user.avatarUrl || "",
    text: note.text,
    time: formatRelativeTime(note.createdAt),
  }));
}

export async function createNetworkNoteForUser(
  currentUserId: string,
  text: string
): Promise<{ error?: string }> {
  if (!text?.trim()) {
    return { error: "Note text is required." };
  }

  const author = await prisma.user.findUnique({
    where: { id: currentUserId },
  });

  if (!author) {
    return { error: "User not found." };
  }

  const cleanText = text.trim();

  await prisma.networkNote.create({
    data: {
      authorId: currentUserId,
      text: cleanText,
    },
  });

  await notifyNetworkNoteCreated(currentUserId, cleanText);

  return {};
}