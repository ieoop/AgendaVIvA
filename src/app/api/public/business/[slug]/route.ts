import { NextResponse } from "next/server";
import { getBusinessBySlug } from "@/lib/demo";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);
  return NextResponse.json(business);
}
