// All monetary values are stored and computed in paise (integer) to avoid
// floating-point drift. Convert to rupees only for display.

export function paiseToInr(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(paise / 100);
}

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export interface GstBreakdown {
  subtotalPaise: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  totalPaise: number;
  gstRate: number;
  isInterState: boolean;
}

// Plan prices are stored GST-INCLUSIVE (the amount actually charged).
// Here we back out the taxable value and the tax split for the invoice.
export function computeGstFromInclusive(opts: {
  totalPaise: number;
  gstRate: number;
  buyerStateCode?: string | null;
  sellerStateCode: string;
}): GstBreakdown {
  const { totalPaise, gstRate, buyerStateCode, sellerStateCode } = opts;
  const subtotalPaise = Math.round(totalPaise / (1 + gstRate / 100));
  const taxPaise = totalPaise - subtotalPaise;

  // Unknown buyer state defaults to intra-state (place of supply = seller).
  const isInterState = !!buyerStateCode && buyerStateCode !== sellerStateCode;

  if (isInterState) {
    return {
      subtotalPaise,
      cgstPaise: 0,
      sgstPaise: 0,
      igstPaise: taxPaise,
      totalPaise,
      gstRate,
      isInterState: true,
    };
  }

  const half = Math.floor(taxPaise / 2);
  return {
    subtotalPaise,
    cgstPaise: half,
    sgstPaise: taxPaise - half, // remainder to SGST so halves sum exactly
    igstPaise: 0,
    totalPaise,
    gstRate,
    isInterState: false,
  };
}

// Plan prices are stored GST-EXCLUSIVE (the taxable base). Here we add the tax
// on top and split it for the invoice. The total is what we charge the gateway.
export function computeGstFromExclusive(opts: {
  basePaise: number;
  gstRate: number;
  buyerStateCode?: string | null;
  sellerStateCode: string;
}): GstBreakdown {
  const { basePaise, gstRate, buyerStateCode, sellerStateCode } = opts;
  const taxPaise = Math.round((basePaise * gstRate) / 100);
  const totalPaise = basePaise + taxPaise;

  // Unknown buyer state defaults to intra-state (place of supply = seller).
  const isInterState = !!buyerStateCode && buyerStateCode !== sellerStateCode;

  if (isInterState) {
    return {
      subtotalPaise: basePaise,
      cgstPaise: 0,
      sgstPaise: 0,
      igstPaise: taxPaise,
      totalPaise,
      gstRate,
      isInterState: true,
    };
  }

  const half = Math.floor(taxPaise / 2);
  return {
    subtotalPaise: basePaise,
    cgstPaise: half,
    sgstPaise: taxPaise - half,
    igstPaise: 0,
    totalPaise,
    gstRate,
    isInterState: false,
  };
}

// The GST-inclusive total charged for a GST-exclusive base price.
export function grossFromBase(basePaise: number, gstRate: number): number {
  return basePaise + Math.round((basePaise * gstRate) / 100);
}
