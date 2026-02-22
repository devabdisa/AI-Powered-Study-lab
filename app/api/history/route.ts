import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

// GET: fetch all history
export async function GET() {
  try {
    const generations = await prisma.generation.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        mode: true,
        title: true,
        difficulty: true,
        fileUsed: true,
        fileName: true,
        course: true,
        year: true,
        isSaved: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ generations });
  } catch (error) {
    console.error("History fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 },
    );
  }
}

// DELETE: delete a specific generation
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    await prisma.generation.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

// PUT: update a generation (e.g. saving it with a title, course, year)
export async function PUT(req: NextRequest) {
  try {
    const { id, title, course, year, isSaved } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const updated = await prisma.generation.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        course: course !== undefined ? course : undefined,
        year: year !== undefined ? year : undefined,
        isSaved: isSaved !== undefined ? isSaved : undefined,
      },
      select: {
        id: true,
        mode: true,
        title: true,
        course: true,
        year: true,
        isSaved: true,
      },
    });

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
