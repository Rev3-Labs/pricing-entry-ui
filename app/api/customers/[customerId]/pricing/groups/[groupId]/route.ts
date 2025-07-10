import { NextRequest, NextResponse } from "next/server";
import { getGroups } from "../data";

export async function GET(
  req: NextRequest,
  context: { params: { customerId: string; groupId: string } }
) {
  const params = await context.params;
  const { groupId } = params;
  const group = getGroups().find((g) => g.priceHeaderId === groupId);
  if (!group) {
    return NextResponse.json(
      { success: false, message: "Group not found" },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, data: group });
}
