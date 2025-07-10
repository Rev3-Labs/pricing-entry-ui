import { NextRequest, NextResponse } from "next/server";
import { getGroups, addGroup } from "./data";

export async function GET(
  req: NextRequest,
  { params }: { params: { customerId: string } }
) {
  const { customerId } = params;
  const customerGroups = getGroups().filter((g) => g.customerId === customerId);
  return NextResponse.json({ success: true, data: customerGroups });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { customerId: string } }
) {
  const { customerId } = params;
  const body = await req.json();
  const { headerName, headerTemplate, items } = body;
  const newId = `PH-${Math.floor(Math.random() * 10000)}`;
  const newGroup = {
    priceHeaderId: newId,
    customerId,
    headerName,
    description: headerTemplate,
    effectiveDate: "2024-01-01",
    expirationDate: "2024-12-31",
    status: "active",
    items: (items || []).map((row: any[], idx: number) => {
      // Parse active dates (index 12) as "YYYY-MM-DD - YYYY-MM-DD"
      let effectiveDate = "";
      let expirationDate = "";
      if (row[12]) {
        const parts = String(row[12])
          .split("-")
          .map((s) => s.trim());
        if (parts.length === 2) {
          effectiveDate = parts[0];
          expirationDate = parts[1];
        }
      }
      return {
        priceItemId: `PI-${newId}-${idx + 1}`,
        priceHeaderId: newId,
        productName: row[0] || "",
        region: row[1] || "",
        profileId: row[2] || "",
        generatorId: row[3] || "",
        contractId: row[4] || "",
        quoteName: row[5] || "",
        jobId: row[6] || "",
        vendorId: row[7] || "",
        containerSize: row[8] || "",
        uom: row[9] || "",
        unitPrice: Number(row[10]) || 0,
        minimumPrice: Number(row[11]) || 0,
        effectiveDate,
        expirationDate,
        status: "active",
      };
    }),
  };
  addGroup(newGroup);
  return NextResponse.json({ success: true, priceHeaderId: newId });
}
