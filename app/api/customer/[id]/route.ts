import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;

    try {
        const body = await request.json();
        const { firstName, lastName, email, phone, address } = body;

        const updatedCustomer = await prisma.customer.update({
            where: { id: parseInt(id) },
            data: {
                firstName,
                lastName,
                email,
                phone,
                address,
            },
        });

        return NextResponse.json({ message: "Customer updated successfully!", updatedCustomer });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update customer", details: (error as Error).message },
            { status: 400 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;

    try {
        await prisma.customer.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json({ message: "Customer deleted successfully!" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete customer", details: (error as Error).message }, { status: 400 });
    }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;

    try {
        // Find the customer by ID
        const customer = await prisma.customer.findUnique({
            where: { id: parseInt(id) },
        });

        if (!customer) {
            return NextResponse.json({ error: "Customer not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Customer found", customer });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to find customer", details: (error as Error).message },
            { status: 400 }
        );
    }
}


