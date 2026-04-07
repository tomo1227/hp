import { verifyCognitoToken } from "@/lib/cognitoJwt";
import { stripe } from "@/lib/stripe";

export type PortalCustomer = {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  address?: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
  } | null;
};

export const getPortalCustomer = async (request: Request) => {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return { error: "Unauthorized", status: 401 } as const;
  }

  let email = "";
  try {
    const payload = await verifyCognitoToken(token);
    email = payload.email ?? "";
  } catch {
    return { error: "Invalid token", status: 401 } as const;
  }

  if (!email) {
    return { error: "Email not found", status: 400 } as const;
  }

  const search = await stripe.customers.search({
    query: `email:'${email.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`,
    limit: 5,
  });

  if (search.data.length === 0) {
    return { error: "customer not found", status: 404 } as const;
  }

  const customer = search.data[0];
  const result: PortalCustomer = {
    id: customer.id,
    email: customer.email ?? email,
    name: customer.name ?? null,
    phone: customer.phone ?? null,
    address: customer.address ?? null,
  };

  return { customer: result } as const;
};
