// Vercel serverless function: proxies the public Weedmaps discovery API
// so the browser can load Pipe & Leaf's live menu without CORS issues.
// Cached at the edge for 10 minutes.

const SLUGS = {
  'airport-way': 'pipe-and-leaf',
  'old-steese': 'pipe-leaf-old-steese',
};

export function slim(m) {
  return {
    name: m.name,
    brand: m.brand_endorsement?.brand_name || null,
    type: m.category?.name || null, // Indica / Sativa / Hybrid / etc.
    cat: m.edge_category?.ancestors?.[0]?.name || m.edge_category?.name || 'Other',
    sub: m.edge_category?.name || null,
    thc: m.metrics?.aggregates?.thc ?? null,
    thcUnit: m.metrics?.aggregates?.thc_unit || '%',
    cbd: m.metrics?.aggregates?.cbd ?? null,
    price: m.price?.price ?? null,
    label: m.price?.label || null,
    sale: !!m.price?.on_sale,
    was: m.price?.on_sale ? (m.price?.original_price ?? null) : null,
  };
}

export default async function handler(req, res) {
  const slug = SLUGS[req.query.location] || SLUGS['airport-way'];
  const pageSize = 150;
  const maxPages = 6;
  const items = [];
  let meta = {};

  try {
    for (let page = 1; page <= maxPages; page++) {
      const url = `https://api-g.weedmaps.com/discovery/v1/listings/dispensaries/${slug}/menu_items?page_size=${pageSize}&page=${page}`;
      const r = await fetch(url, {
        headers: {
          accept: 'application/json',
          'user-agent': 'Mozilla/5.0 (compatible; PipeAndLeafSite/1.0; +https://pipeandleaf.nealmedia.app)',
        },
      });
      if (!r.ok) throw new Error(`upstream ${r.status}`);
      const j = await r.json();
      meta = j.meta || meta;
      const batch = j.data?.menu_items || [];
      items.push(...batch);
      if (batch.length < pageSize) break;
      if (meta.total_menu_items && items.length >= meta.total_menu_items) break;
    }

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.status(200).json({
      updated: meta.updated_at || null,
      total: meta.total_menu_items || items.length,
      items: items.map(slim),
    });
  } catch (e) {
    res.setHeader('Cache-Control', 's-maxage=60');
    res.status(502).json({ error: 'menu_unavailable', detail: String(e.message || e) });
  }
}
