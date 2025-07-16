import { NextRequest, NextResponse } from "next/server";
import { getQuotes } from "../data";

export async function GET(
  req: NextRequest,
  context: { params: { customerId: string; quoteId: string } }
) {
  const params = await context.params;
  const { quoteId } = params;
  const quote = getQuotes().find((q) => q.priceHeaderId === quoteId);
  if (!quote) {
    return NextResponse.json(
      { success: false, message: "Quote not found" },
      { status: 404 }
    );
  }

  // Transform the data to match what the pricing entry screen expects
  const transformedData = {
    headerName: quote.headerName,
    description: quote.description,
    effectiveDate: quote.effectiveDate,
    expirationDate: quote.expirationDate,
    status: quote.status,
    assignment: {
      assignedTeamMember: quote.assignedTeamMember || "Sarah Johnson",
      assignmentNotes:
        quote.assignmentNotes ||
        "High priority customer - needs quick turnaround",
    },
    items: quote.items.map((item: any) => ({
      priceItemId: item.priceItemId,
      pricingType: item.pricingType || "Regional",
      pricePriority: item.pricePriority || "1",
      customerId: item.customerId || quote.customerId,
      productId: item.productName || "",
      regionId: item.region || "",
      profileId: item.profileId || "",
      generatorId: item.generatorId || "",
      contractId: item.contractId || "",
      quoteId: item.quoteName || "",
      jobId: item.jobId || "",
      generatorRegionId: item.generatorRegionId || "",
      vendorId: item.vendorId || "",
      containerSizeId: item.containerSize || "",
      billingUomId: item.billingUom || item.uom || "",
      unitPrice: item.unitPrice || 0,
      minimumPrice: item.minimumPrice || 0,
      effectiveDate: item.effectiveDate || quote.effectiveDate,
      expirationDate: item.expirationDate || quote.expirationDate,
    })),
  };

  return NextResponse.json({ success: true, data: transformedData });
}
