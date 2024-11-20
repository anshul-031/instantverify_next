import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const signupSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  password: z.string().min(8),
  dateOfBirth: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, password, dateOfBirth } = signupSchema.parse(body);

    const exists = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (exists) {
      return NextResponse.json(
        { message: "User with this email or phone already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        dateOfBirth: new Date(dateOfBirth),
      },
    });

    // TODO: Send verification email
    // For now, we'll just return success

    return NextResponse.json({
      message: "Verification email sent",
      userId: user.id,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}