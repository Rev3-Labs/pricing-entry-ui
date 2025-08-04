import { NextRequest, NextResponse } from "next/server";

// Mock customer data - replace with actual database query
const mockCustomers = [
  {
    customerId: "1",
    customerName: "Acme Corporation",
    oracleCustomerId: "ORC001",
    customerCode: "ACME",
    status: "active",
  },
  {
    customerId: "2",
    customerName: "Tech Solutions Inc",
    oracleCustomerId: "ORC002",
    customerCode: "TECH",
    status: "active",
  },
  {
    customerId: "3",
    customerName: "Global Industries",
    oracleCustomerId: "ORC003",
    customerCode: "GLBL",
    status: "inactive",
  },
  {
    customerId: "4",
    customerName: "Clean Earth Partners",
    oracleCustomerId: "ORC004",
    customerCode: "CLEAN",
    status: "active",
  },
  {
    customerId: "5",
    customerName: "Environmental Services Co",
    oracleCustomerId: "ORC005",
    customerCode: "ENV",
    status: "active",
  },
  {
    customerId: "6",
    customerName: "Waste Management Solutions",
    oracleCustomerId: "ORC006",
    customerCode: "WMS",
    status: "inactive",
  },
  {
    customerId: "7",
    customerName: "Green Energy Corp",
    oracleCustomerId: "ORC007",
    customerCode: "GREEN",
    status: "active",
  },
  {
    customerId: "8",
    customerName: "Industrial Cleanup Ltd",
    oracleCustomerId: "ORC008",
    customerCode: "IND",
    status: "active",
  },
  {
    customerId: "9",
    customerName: "Eco Solutions Group",
    oracleCustomerId: "ORC009",
    customerCode: "ECO",
    status: "inactive",
  },
  {
    customerId: "10",
    customerName: "Sustainable Waste Systems",
    oracleCustomerId: "ORC010",
    customerCode: "SWS",
    status: "active",
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim() === "") {
      return NextResponse.json({
        data: [],
        success: true,
        message: "No search query provided",
      });
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Filter customers based on search query
    const filteredCustomers = mockCustomers.filter(
      (customer) =>
        customer.customerName.toLowerCase().includes(query.toLowerCase()) ||
        customer.oracleCustomerId
          ?.toLowerCase()
          .includes(query.toLowerCase()) ||
        customer.customerCode?.toLowerCase().includes(query.toLowerCase())
    );

    return NextResponse.json({
      data: filteredCustomers,
      success: true,
      message: `Found ${filteredCustomers.length} customers`,
    });
  } catch (error) {
    console.error("Customer search error:", error);
    return NextResponse.json(
      {
        data: [],
        success: false,
        message: "Failed to search customers",
        errors: [error instanceof Error ? error.message : "Unknown error"],
      },
      { status: 500 }
    );
  }
}
