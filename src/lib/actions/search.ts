"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import type { Company, Deal } from "@prisma/client";

export type SearchResults = {
  companies: {
    id: string;
    name: string;
    industry: Company["industry"];
  }[];
  contacts: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
  }[];
  deals: {
    id: string;
    title: string;
    stage: Deal["stage"];
  }[];
};

export async function globalSearch(query: string): Promise<SearchResults> {
  const user = await requireUser();

  if (!query || query.trim().length === 0) {
    return { companies: [], contacts: [], deals: [] };
  }

  const trimmed = query.trim();

  const [companies, contacts, deals] = await Promise.all([
    prisma.company.findMany({
      where: {
        createdById: user.id,
        name: { contains: trimmed, mode: "insensitive" },
      },
      select: {
        id: true,
        name: true,
        industry: true,
      },
      take: 5,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.contact.findMany({
      where: {
        createdById: user.id,
        OR: [
          { firstName: { contains: trimmed, mode: "insensitive" } },
          { lastName: { contains: trimmed, mode: "insensitive" } },
          { email: { contains: trimmed, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
      take: 5,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.deal.findMany({
      where: {
        ownerId: user.id,
        title: { contains: trimmed, mode: "insensitive" },
      },
      select: {
        id: true,
        title: true,
        stage: true,
      },
      take: 5,
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return { companies, contacts, deals };
}
