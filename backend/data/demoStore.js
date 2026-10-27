const bcrypt = require("bcryptjs");

// Pre-hash passwords using bcryptjs for secure authentication
const SALT_ROUNDS = 10;
const HASHED_CUSTOMER_PW = bcrypt.hashSync("customer123", SALT_ROUNDS);
const HASHED_SELLER_PW = bcrypt.hashSync("seller123", SALT_ROUNDS);
const HASHED_ADMIN_PW = bcrypt.hashSync("admin123", SALT_ROUNDS);

// Predefined Demo Accounts & Users
let users = [
    {
        _id: "65f000000000000000000001",
        id: "65f000000000000000000001",
        name: "Admin User",
        email: "admin@demo.com",
        password: HASHED_ADMIN_PW,
        role: "admin",
        createdAt: new Date("2026-01-01T08:00:00Z")
    },
    {
        _id: "65f000000000000000000002",
        id: "65f000000000000000000002",
        name: "Ramesh Sharma (Demo Seller)",
        email: "seller@demo.com",
        password: HASHED_SELLER_PW,
        role: "seller",
        createdAt: new Date("2026-01-05T09:30:00Z")
    },
    {
        _id: "65f000000000000000000003",
        id: "65f000000000000000000003",
        name: "Pooja Patel (Demo Customer)",
        email: "customer@demo.com",
        password: HASHED_CUSTOMER_PW,
        role: "customer",
        createdAt: new Date("2026-01-10T11:15:00Z")
    },
    {
        _id: "65f000000000000000000004",
        id: "65f000000000000000000004",
        name: "Arjun Verma",
        email: "arjun@example.com",
        password: HASHED_CUSTOMER_PW,
        role: "customer",
        createdAt: new Date("2026-01-12T14:20:00Z")
    },
    {
        _id: "65f000000000000000000005",
        id: "65f000000000000000000005",
        name: "Sneha Mukherjee",
        email: "sneha@example.com",
        password: HASHED_CUSTOMER_PW,
        role: "customer",
        createdAt: new Date("2026-01-15T16:45:00Z")
    }
];

// Predefined Demo Businesses across all 6 required categories:
// Food, Medicine, Carpenter, Plumber, Electrician, Grocery
let businesses = [
    // ── FOOD ───────────────────────────────────────────────────
    {
        _id: "65f100000000000000000001",
        id: "65f100000000000000000001",
        name: "Spice Route Bistro & Tandoor",
        category: "Food",
        description: "Authentic North & South Indian curries, handi biryanis, clay oven tandoori dishes, and home delivery.",
        address: "42 MG Road, Near Metro Pillar 84, Indiranagar",
        phone: "+91 98765 43210",
        email: "contact@spiceroutebistro.com",
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        owner: "65f000000000000000000002",
        createdAt: new Date("2026-01-15T10:00:00Z")
    },
    {
        _id: "65f100000000000000000002",
        id: "65f100000000000000000002",
        name: "Bean & Brew Artisan Cafe",
        category: "Food",
        description: "Specialty espresso coffee bar, cold brew blends, wood-fired artisan pizzas, and sourdough gourmet toasts.",
        address: "15 Park Street, Commercial Square",
        phone: "+91 98234 56789",
        email: "hello@beanandbrew.com",
        image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
        owner: "65f000000000000000000002",
        createdAt: new Date("2026-01-16T11:00:00Z")
    },
    {
        _id: "65f100000000000000000003",
        id: "65f100000000000000000003",
        name: "Golden Crust Oven Bakery",
        category: "Food",
        description: "Fresh daily oven-baked sourdough, multigrain breads, celebration cakes, croissants, and savory baked puffs.",
        address: "88 Bakery Lane, Central Market",
        phone: "+91 98111 22334",
        email: "orders@goldencrustbakery.com",
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
        owner: "65f000000000000000000002",
        createdAt: new Date("2026-01-17T09:00:00Z")
    },

    // ── MEDICINE ───────────────────────────────────────────────
    {
        _id: "65f100000000000000000004",
        id: "65f100000000000000000004",
        name: "CityCare 24/7 Pharmacy & Wellness",
        category: "Medicine",
        description: "Full-line licensed pharmacy stocking prescription medicines, vitamins, first aid kits, and diabetic care essentials.",
        address: "102 Hospital Road, Civil Lines",
        phone: "+91 98345 67890",
        email: "support@citycarepharmacy.com",
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
        owner: "65f000000000000000000002",
        createdAt: new Date("2026-01-18T08:00:00Z")
    },
    {
        _id: "65f100000000000000000005",
        id: "65f100000000000000000005",
        name: "MediPlus Healthcare & Diagnostics",
        category: "Medicine",
        description: "Healthcare monitoring devices, BP monitors, nebulizers, surgical supplies, and reliable door-to-door delivery.",
        address: "25 Health Avenue, Block C, Green Park",
        phone: "+91 98456 78901",
        email: "care@mediplusstore.com",
        image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=800&q=80",
        owner: "65f000000000000000000002",
        createdAt: new Date("2026-01-19T10:30:00Z")
    },
    {
        _id: "65f100000000000000000006",
        id: "65f100000000000000000006",
        name: "QuickMeds Express Delivery",
        category: "Medicine",
        description: "Fast 45-minute doorstep medicine delivery with computerized bills, batch verification, and cold-chain storage.",
        address: "77 Ring Road, Phase 2",
        phone: "+91 98567 89012",
        email: "dispatch@quickmedsexpress.com",
        image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=800&q=80",
        owner: "65f000000000000000000002",
        createdAt: new Date("2026-01-20T11:45:00Z")
    },

    // ── CARPENTER ──────────────────────────────────────────────
    {
        _id: "65f100000000000000000007",
        id: "65f100000000000000000007",
        name: "Royal Oak Furniture Repair & Restoration",
        category: "Carpenter",
        description: "Skilled woodwork repairs, dining table restoration, sofa frame alignment, and PU spray polishing.",
        address: "14 Timber Yard, Industrial Estate",
        phone: "+91 98678 90123",
        email: "service@royaloakrepairs.com",
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
        owner: "65f000000000000000000002",
        createdAt: new Date("2026-01-21T09:15:00Z")
    },
    {
        _id: "65f100000000000000000008",
        id: "65f100000000000000000008",
        name: "TimberCraft Custom Interiors",
        category: "Carpenter",
        description: "Bespoke modular kitchens, solid teak wardrobes, floating wall shelves, and custom office wooden furniture.",
        address: "59 Craftsmen Street, Studio 3",
        phone: "+91 98789 01234",
        email: "design@timbercraftinteriors.com",
        image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80",
        owner: "65f000000000000000000002",
        createdAt: new Date("2026-01-22T13:00:00Z")
    },
    {
        _id: "65f100000000000000000009",
        id: "65f100000000000000000009",
        name: "Urban Woodcrafters Home Services",
        category: "Carpenter",
        description: "Door locks fitting, sliding wardrobe roller repair, wooden partitions, and general residential carpentry.",
        address: "31 Gandhi Nagar, 4th Cross",
        phone: "+91 98890 12345",
        email: "help@urbanwoodcrafters.com",
        image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80",
        owner: "65f000000000000000000002",
        createdAt: new Date("2026-01-23T15:20:00Z")
    },

    // ── PLUMBER ────────────────────────────────────────────────
    {
        _id: "65f100000000000000000010",
        id: "65f100000000000000000010",
        name: "SpeedyFlow Plumbing & Leak Solutions",
        category: "Plumber",
        description: "Fast response emergency leak fixing, tap cartridge replacement, bathroom geyser installation, and drain clearing.",
        address: "19 Water Works Road, Ward 7",
        phone: "+91 98901 23456",
        email: "service@speedyflowplumbing.com",
        image: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80",
        owner: "65f000000000000000000002",
        createdAt: new Date("2026-01-24T08:30:00Z")
    },
    {
        _id: "65f100000000000000000011",
        id: "65f100000000000000000011",
        name: "Apex Piping & Drainage Solutions",
        category: "Plumber",
        description: "Residential & commercial CPVC pipeline installation, sewer line unblocking, overhead tank cleaning, and water pumps.",
        address: "63 Pipeline Colony, Outer Ring",
        phone: "+91 98012 34567",
        email: "info@apexpipingsolutions.com",
        image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80",
        owner: "65f000000000000000000002",
        createdAt: new Date("2026-01-25T11:00:00Z")
    },
    {
        _id: "65f100000000000000000012",
        id: "65f100000000000000000012",
        name: "ClearWater Sanitary & Bath Fittings",
        category: "Plumber",
        description: "Complete bathroom renovation, concealed cistern maintenance, shower panel fittings, and luxury sanitary ware repair.",
        address: "112 Royal Arcade, Near City Mall",
        phone: "+91 98123 45678",
        email: "bath@clearwatersanitary.com",
        image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
        owner: "65f000000000000000000002",
        createdAt: new Date("2026-01-26T14:15:00Z")
    },

    // ── ELECTRICIAN ────────────────────────────────────────────
    {
        _id: "65f100000000000000000013",
        id: "65f100000000000000000013",
        name: "VoltMaster Electrical Services",
        category: "Electrician",
        description: "Certified electricians for domestic short circuit detection, MCB tripping repair, ceiling fans, and LED panel lights.",
        address: "22 Power House Lane, Main Bazaar",
        phone: "+91 98234 56781",
        email: "support@voltmasterelectrical.com",
        image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
        owner: "65f000000000000000000002",
        createdAt: new Date("2026-01-27T09:00:00Z")
    },
    {
        _id: "65f100000000000000000014",
        id: "65f100000000000000000014",
        name: "BrightSpark Home & Commercial Wiring",
        category: "Electrician",
        description: "Full house wiring, electrical distribution panels, smart home automation switches, and copper earthing.",
        address: "85 Circuit Complex, Tech Zone",
        phone: "+91 98345 67892",
        email: "projects@brightsparkwiring.com",
        image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
        owner: "65f000000000000000000002",
        createdAt: new Date("2026-01-28T12:30:00Z")
    },
    {
        _id: "65f100000000000000000015",
        id: "65f100000000000000000015",
        name: "PowerFix AC & Appliance Care",
        category: "Electrician",
        description: "Inverter battery servicing, AC gas charging & power stabilizer setup, kitchen chimneys, and microwave repairs.",
        address: "47 Green Valley, Sector 9",
        phone: "+91 98456 78903",
        email: "service@powerfixappliances.com",
        image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
        owner: "65f000000000000000000002",
        createdAt: new Date("2026-01-29T16:00:00Z")
    },

    // ── GROCERY ────────────────────────────────────────────────
    {
        _id: "65f100000000000000000016",
        id: "65f100000000000000000016",
        name: "GreenBasket Fresh Mart",
        category: "Grocery",
        description: "Farm-fresh organic fruits, vegetables, cold-pressed oils, organic pulses, honey, and whole grains.",
        address: "9 Sunrise Boulevard, Sector 15",
        phone: "+91 98567 89014",
        email: "fresh@greenbasketmart.com",
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
        owner: "65f000000000000000000002",
        createdAt: new Date("2026-01-30T07:30:00Z")
    },
    {
        _id: "65f100000000000000000017",
        id: "65f100000000000000000017",
        name: "DailyNeeds Supermarket & Provisions",
        category: "Grocery",
        description: "Complete neighborhood supermarket stocking kitchen staples, spices, packaged goods, and personal hygiene items.",
        address: "120 Market Square, Opposite Central Bank",
        phone: "+91 98678 90125",
        email: "store@dailyneedssupermarket.com",
        image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80",
        owner: "65f000000000000000000002",
        createdAt: new Date("2026-01-31T08:45:00Z")
    },
    {
        _id: "65f100000000000000000018",
        id: "65f100000000000000000018",
        name: "QuickMart Express Groceries",
        category: "Grocery",
        description: "Lightning-fast 30-minute delivery of milk, bread, butter, eggs, farm veggies, and household snacks.",
        address: "34 Express Highway Hub, Block D",
        phone: "+91 98789 01236",
        email: "delivery@quickmartgrocery.com",
        image: "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=800&q=80",
        owner: "65f000000000000000000002",
        createdAt: new Date("2026-02-01T10:00:00Z")
    }
];

// Predefined Demo Products & Services for each Category & Business
let products = [
    // Spice Route Bistro
    {
        _id: "65f200000000000000000001",
        id: "65f200000000000000000001",
        name: "Butter Chicken & Garlic Naan Combo",
        description: "Rich tomato cream curry with tender tandoori chicken, served with 2 crispy buttered garlic naans.",
        price: 380,
        category: "Food",
        type: "product",
        business: "65f100000000000000000001",
        image: "",
        createdAt: new Date("2026-02-01T12:00:00Z")
    },
    {
        _id: "65f200000000000000000002",
        id: "65f200000000000000000002",
        name: "Paneer Tikka Platter (6 Pcs)",
        description: "Marinated cottage cheese cubes grilled with capsicum and onions in traditional clay tandoor.",
        price: 290,
        category: "Food",
        type: "product",
        business: "65f100000000000000000001",
        image: "",
        createdAt: new Date("2026-02-01T12:05:00Z")
    },
    {
        _id: "65f200000000000000000003",
        id: "65f200000000000000000003",
        name: "Private Party Food Catering Service",
        description: "Full buffet setup with chef service for family gatherings and celebrations (rates per 10 guests).",
        price: 3500,
        category: "Food",
        type: "service",
        business: "65f100000000000000000001",
        image: "",
        createdAt: new Date("2026-02-01T12:10:00Z")
    },

    // Bean & Brew Cafe
    {
        _id: "65f200000000000000000004",
        id: "65f200000000000000000004",
        name: "Signature Single-Origin Flat White",
        description: "Double shot of freshly roasted Arabica beans with velvety micro-foam milk.",
        price: 180,
        category: "Food",
        type: "product",
        business: "65f100000000000000000002",
        image: "",
        createdAt: new Date("2026-02-01T12:15:00Z")
    },
    {
        _id: "65f200000000000000000005",
        id: "65f200000000000000000005",
        name: "Wood-Fired Margherita Pizza",
        description: "San Marzano tomato sauce, fresh buffalo mozzarella, fresh basil, and extra virgin olive oil.",
        price: 340,
        category: "Food",
        type: "product",
        business: "65f100000000000000000002",
        image: "",
        createdAt: new Date("2026-02-01T12:20:00Z")
    },

    // Golden Crust Bakery
    {
        _id: "65f200000000000000000006",
        id: "65f200000000000000000006",
        name: "Artisan Multigrain Sourdough Loaf",
        description: "Naturally fermented 24-hour dough with flax, chia, and sunflower seeds.",
        price: 150,
        category: "Food",
        type: "product",
        business: "65f100000000000000000003",
        image: "",
        createdAt: new Date("2026-02-01T12:25:00Z")
    },
    {
        _id: "65f200000000000000000007",
        id: "65f200000000000000000007",
        name: "Belgian Dark Chocolate Truffle Cake (500g)",
        description: "Pure 60% Belgian cocoa layered with chocolate ganache and chocolate curls.",
        price: 550,
        category: "Food",
        type: "product",
        business: "65f100000000000000000003",
        image: "",
        createdAt: new Date("2026-02-01T12:30:00Z")
    },

    // CityCare Pharmacy
    {
        _id: "65f200000000000000000008",
        id: "65f200000000000000000008",
        name: "Digital Blood Pressure Monitor",
        description: "Clinically validated upper-arm BP monitor with large LCD screen and memory store.",
        price: 1450,
        category: "Medicine",
        type: "product",
        business: "65f100000000000000000004",
        image: "",
        createdAt: new Date("2026-02-01T12:35:00Z")
    },
    {
        _id: "65f200000000000000000009",
        id: "65f200000000000000000009",
        name: "Emergency 24/7 Prescription Delivery",
        description: "Priority doorstep delivery of urgent medicines and infant care products.",
        price: 50,
        category: "Medicine",
        type: "service",
        business: "65f100000000000000000004",
        image: "",
        createdAt: new Date("2026-02-01T12:40:00Z")
    },

    // MediPlus Healthcare
    {
        _id: "65f200000000000000000010",
        id: "65f200000000000000000010",
        name: "Heavy-Duty Compressor Nebulizer",
        description: "Reliable respiratory therapy nebulizer kit suitable for kids and adults.",
        price: 1200,
        category: "Medicine",
        type: "product",
        business: "65f100000000000000000005",
        image: "",
        createdAt: new Date("2026-02-01T12:45:00Z")
    },

    // QuickMeds Delivery
    {
        _id: "65f200000000000000000011",
        id: "65f200000000000000000011",
        name: "Comprehensive Home First Aid Kit",
        description: "Over 40 essential items including antiseptics, bandages, burn cream, and scissors.",
        price: 450,
        category: "Medicine",
        type: "product",
        business: "65f100000000000000000006",
        image: "",
        createdAt: new Date("2026-02-01T12:50:00Z")
    },

    // Royal Oak Carpenter
    {
        _id: "65f200000000000000000012",
        id: "65f200000000000000000012",
        name: "Wooden Dining Table Restoration & Polish",
        description: "Scratch sanding, stain treatment, and premium melamine PU clear spray polish.",
        price: 850,
        category: "Carpenter",
        type: "service",
        business: "65f100000000000000000007",
        image: "",
        createdAt: new Date("2026-02-01T12:55:00Z")
    },
    {
        _id: "65f200000000000000000013",
        id: "65f200000000000000000013",
        name: "Sofa Frame Repair & Spring Tightening",
        description: "Internal hardwood frame reinforcement and sagging spring replacement.",
        price: 1200,
        category: "Carpenter",
        type: "service",
        business: "65f100000000000000000007",
        image: "",
        createdAt: new Date("2026-02-01T13:00:00Z")
    },

    // TimberCraft Custom
    {
        _id: "65f200000000000000000014",
        id: "65f200000000000000000014",
        name: "Modular Kitchen Consultation & 3D Design",
        description: "Site measurement, material selection consultation, and photo-realistic 3D layout rendering.",
        price: 1500,
        category: "Carpenter",
        type: "service",
        business: "65f100000000000000000008",
        image: "",
        createdAt: new Date("2026-02-01T13:05:00Z")
    },
    {
        _id: "65f200000000000000000015",
        id: "65f200000000000000000015",
        name: "Custom Solid Sheesham Bookshelf (4-Tier)",
        description: "Handcrafted natural wood bookcase with smooth lacquer finish.",
        price: 5800,
        category: "Carpenter",
        type: "product",
        business: "65f100000000000000000008",
        image: "",
        createdAt: new Date("2026-02-01T13:10:00Z")
    },

    // Urban Woodcrafters
    {
        _id: "65f200000000000000000016",
        id: "65f200000000000000000016",
        name: "Door Lock & Handle Fitting Service",
        description: "Precision installation of mortise locks, handles, tower bolts, and latches.",
        price: 350,
        category: "Carpenter",
        type: "service",
        business: "65f100000000000000000009",
        image: "",
        createdAt: new Date("2026-02-01T13:15:00Z")
    },

    // SpeedyFlow Plumber
    {
        _id: "65f200000000000000000017",
        id: "65f200000000000000000017",
        name: "Emergency Pipe Leak Repair Service",
        description: "Quick diagnostic and repair of concealed or exposed leaking CPVC/GI pipes.",
        price: 450,
        category: "Plumber",
        type: "service",
        business: "65f100000000000000000010",
        image: "",
        createdAt: new Date("2026-02-01T13:20:00Z")
    },
    {
        _id: "65f200000000000000000018",
        id: "65f200000000000000000018",
        name: "Kitchen Sink & Drain Unblocking",
        description: "Heavy-duty chemical and mechanical unblocking of choked kitchen sink drain lines.",
        price: 500,
        category: "Plumber",
        type: "service",
        business: "65f100000000000000000010",
        image: "",
        createdAt: new Date("2026-02-01T13:25:00Z")
    },

    // Apex Piping
    {
        _id: "65f200000000000000000019",
        id: "65f200000000000000000019",
        name: "Overhead Water Tank Cleaning Service",
        description: "High-pressure jet wash, sludge removal, and UV sterilization for 500-1000L tanks.",
        price: 950,
        category: "Plumber",
        type: "service",
        business: "65f100000000000000000011",
        image: "",
        createdAt: new Date("2026-02-01T13:30:00Z")
    },

    // ClearWater Sanitary
    {
        _id: "65f200000000000000000020",
        id: "65f200000000000000000020",
        name: "Concealed Flush Cistern Repair",
        description: "Repair and valve replacement for in-wall flush tanks and wall-hung commodes.",
        price: 750,
        category: "Plumber",
        type: "service",
        business: "65f100000000000000000012",
        image: "",
        createdAt: new Date("2026-02-01T13:35:00Z")
    },

    // VoltMaster Electrician
    {
        _id: "65f200000000000000000021",
        id: "65f200000000000000000021",
        name: "Short Circuit & MCB Tripping Diagnostic",
        description: "Trace hidden wire burnouts, repair tripped MCB switches, and fix neutral faults.",
        price: 400,
        category: "Electrician",
        type: "service",
        business: "65f100000000000000000013",
        image: "",
        createdAt: new Date("2026-02-01T13:40:00Z")
    },
    {
        _id: "65f200000000000000000022",
        id: "65f200000000000000000022",
        name: "Ceiling Fan & Regulator Installation",
        description: "Safe ceiling hook hanging, electronic regulator wiring, and balance check.",
        price: 250,
        category: "Electrician",
        type: "service",
        business: "65f100000000000000000013",
        image: "",
        createdAt: new Date("2026-02-01T13:45:00Z")
    },

    // BrightSpark Wiring
    {
        _id: "65f200000000000000000023",
        id: "65f200000000000000000023",
        name: "Complete Single Room Concealed Rewiring",
        description: "Fire-resistant copper wiring, PVC conduits, switchboard points, and testing.",
        price: 1800,
        category: "Electrician",
        type: "service",
        business: "65f100000000000000000014",
        image: "",
        createdAt: new Date("2026-02-01T13:50:00Z")
    },

    // PowerFix Appliances
    {
        _id: "65f200000000000000000024",
        id: "65f200000000000000000024",
        name: "Split AC Servicing & Power Diagnostic",
        description: "Indoor coil jet cleaning, outdoor unit power check, and gas pressure reading.",
        price: 799,
        category: "Electrician",
        type: "service",
        business: "65f100000000000000000015",
        image: "",
        createdAt: new Date("2026-02-01T13:55:00Z")
    },

    // GreenBasket Grocery
    {
        _id: "65f200000000000000000025",
        id: "65f200000000000000000025",
        name: "Weekly Organic Farm Vegetable Basket (7kg)",
        description: "Curated harvest including potatoes, onions, tomatoes, spinach, bell peppers, and carrots.",
        price: 499,
        category: "Grocery",
        type: "product",
        business: "65f100000000000000000016",
        image: "",
        createdAt: new Date("2026-02-01T14:00:00Z")
    },
    {
        _id: "65f200000000000000000026",
        id: "65f200000000000000000026",
        name: "Wood-Pressed Pure Mustard Oil (1 Litre)",
        description: "Unrefined cold-pressed mustard oil with natural pungency and health benefits.",
        price: 240,
        category: "Grocery",
        type: "product",
        business: "65f100000000000000000016",
        image: "",
        createdAt: new Date("2026-02-01T14:05:00Z")
    },

    // DailyNeeds Supermarket
    {
        _id: "65f200000000000000000027",
        id: "65f200000000000000000027",
        name: "Aashirvaad Sharbati Wheat Atta (10kg)",
        description: "100% pure Madhya Pradesh Sharbati whole wheat flour for fluffy rotis.",
        price: 460,
        category: "Grocery",
        type: "product",
        business: "65f100000000000000000017",
        image: "",
        createdAt: new Date("2026-02-01T14:10:00Z")
    },

    // QuickMart 30-Min
    {
        _id: "65f200000000000000000028",
        id: "65f200000000000000000028",
        name: "Farm Fresh Table Eggs (Tray of 30)",
        description: "Cleaned, sanitized, high-protein white eggs delivered within 30 minutes.",
        price: 210,
        category: "Grocery",
        type: "product",
        business: "65f100000000000000000018",
        image: "",
        createdAt: new Date("2026-02-01T14:15:00Z")
    }
];

// Predefined Demo Customer Reviews
let reviews = [
    {
        _id: "65f300000000000000000001",
        id: "65f300000000000000000001",
        user: "65f000000000000000000003", // Demo Customer
        business: "65f100000000000000000001", // Spice Route
        rating: 5,
        comment: "The butter chicken was heavenly and the garlic naans were freshly baked! Delivered in 25 minutes hot and fresh.",
        createdAt: new Date("2026-02-02T18:30:00Z")
    },
    {
        _id: "65f300000000000000000002",
        id: "65f300000000000000000002",
        user: "65f000000000000000000004", // Arjun Verma
        business: "65f100000000000000000001", // Spice Route
        rating: 4,
        comment: "Great paneer tikka platter. Authentic smoky tandoor flavor. Highly recommended for family dinners.",
        createdAt: new Date("2026-02-03T19:45:00Z")
    },
    {
        _id: "65f300000000000000000003",
        id: "65f300000000000000000003",
        user: "65f000000000000000000005", // Sneha Mukherjee
        business: "65f100000000000000000002", // Bean & Brew Cafe
        rating: 5,
        comment: "Best artisan coffee in the neighborhood! Smooth micro-foam on the flat white and the cafe ambiance is wonderful.",
        createdAt: new Date("2026-02-04T10:15:00Z")
    },
    {
        _id: "65f300000000000000000004",
        id: "65f300000000000000000004",
        user: "65f000000000000000000003", // Demo Customer
        business: "65f100000000000000000004", // CityCare Pharmacy
        rating: 5,
        comment: "Super helpful staff. They had all my prescribed cardiac medicines in stock and arranged doorstep delivery promptly.",
        createdAt: new Date("2026-02-05T14:20:00Z")
    },
    {
        _id: "65f300000000000000000005",
        id: "65f300000000000000000005",
        user: "65f000000000000000000004", // Arjun Verma
        business: "65f100000000000000000007", // Royal Oak Carpenter
        rating: 5,
        comment: "Restored our 12-year-old teak dining table. The PU polish finish looks brand new! Prompt and polite carpenter.",
        createdAt: new Date("2026-02-06T16:00:00Z")
    },
    {
        _id: "65f300000000000000000006",
        id: "65f300000000000000000006",
        user: "65f000000000000000000005", // Sneha Mukherjee
        business: "65f100000000000000000010", // SpeedyFlow Plumber
        rating: 5,
        comment: "Fixed a concealed bathroom pipe leak within 45 minutes of booking. Very reasonable pricing and clean workmanship.",
        createdAt: new Date("2026-02-07T11:30:00Z")
    },
    {
        _id: "65f300000000000000000007",
        id: "65f300000000000000000007",
        user: "65f000000000000000000003", // Demo Customer
        business: "65f100000000000000000013", // VoltMaster Electrician
        rating: 5,
        comment: "Quickly diagnosed our repeatedly tripping MCB. Replaced the faulty fuse safely and checked all house connections.",
        createdAt: new Date("2026-02-08T15:10:00Z")
    },
    {
        _id: "65f300000000000000000008",
        id: "65f300000000000000000008",
        user: "65f000000000000000000004", // Arjun Verma
        business: "65f100000000000000000016", // GreenBasket Grocery
        rating: 4,
        comment: "Very fresh organic veggies and greens. Neatly packed in recyclable paper bags. Good local store!",
        createdAt: new Date("2026-02-09T09:40:00Z")
    }
];

// ─────────────────────────────────────────────────────────────
// Helper Functions for Data Access & Operations
// ─────────────────────────────────────────────────────────────

// Helper to generate a 24-character hexadecimal ObjectId-like string
let idCounter = 1000;
const generateId = (prefix = "65ff") => {
    idCounter++;
    return `${prefix}${String(idCounter).padStart(20, "0")}`;
};

// Compute review statistics for a specific business
const computeReviewStats = (businessId) => {
    const bizReviews = reviews.filter((r) => r.business.toString() === businessId.toString());
    const count = bizReviews.length;
    const averageRating =
        count > 0
            ? Number((bizReviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1))
            : 0;
    return { reviewCount: count, averageRating };
};

// Helper to populate user details
const populateUser = (userId) => {
    const user = users.find((u) => u._id.toString() === userId.toString());
    if (!user) return { _id: userId, name: "Customer", email: "" };
    return {
        _id: user._id,
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: user.role
    };
};

// Helper to populate business details
const populateBusiness = (businessId) => {
    const biz = businesses.find((b) => b._id.toString() === businessId.toString());
    if (!biz) return { _id: businessId, name: "Local Business", category: "General" };
    return {
        _id: biz._id,
        id: biz.id || biz._id,
        name: biz.name,
        category: biz.category,
        address: biz.address,
        phone: biz.phone,
        email: biz.email,
        image: biz.image
    };
};

const demoStore = {
    // ── USERS ────────────────────────────────────────────────
    findUserByEmail: (email) => {
        if (!email) return null;
        return users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
    },

    findUserById: (id) => {
        if (!id) return null;
        return users.find((u) => u._id.toString() === id.toString()) || null;
    },

    createUser: ({ name, email, password, role }) => {
        const id = generateId("65f0");
        const newUser = {
            _id: id,
            id,
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password, // Already hashed with bcryptjs
            role: role || "customer",
            createdAt: new Date()
        };
        users.push(newUser);
        return newUser;
    },

    getUserStats: () => {
        const totalUsers = users.length;
        const totalCustomers = users.filter((u) => u.role === "customer").length;
        const totalSellers = users.filter((u) => u.role === "seller").length;
        const totalBusinesses = businesses.length;
        const totalProducts = products.length;
        const totalReviews = reviews.length;
        const recentUsers = [...users]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map((u) => ({
                _id: u._id,
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role,
                createdAt: u.createdAt
            }));

        return {
            stats: {
                totalUsers,
                totalCustomers,
                totalSellers,
                totalBusinesses,
                totalProducts,
                totalReviews
            },
            recentUsers
        };
    },

    // ── BUSINESSES ───────────────────────────────────────────
    getBusinesses: ({ category, search, owner } = {}) => {
        let result = [...businesses];

        if (category && category !== "All") {
            const catLower = category.toLowerCase().trim();
            result = result.filter((b) => b.category.toLowerCase() === catLower);
        }

        if (owner) {
            result = result.filter((b) => b.owner.toString() === owner.toString());
        }

        if (search && search.trim() !== "") {
            const q = search.toLowerCase().trim();
            result = result.filter((b) => {
                const nameMatch = b.name.toLowerCase().includes(q);
                const descMatch = b.description.toLowerCase().includes(q);
                const addrMatch = b.address.toLowerCase().includes(q);
                // Also check if any associated product matches search (e.g. "pizza")
                const productMatch = products.some(
                    (p) =>
                        p.business.toString() === b._id.toString() &&
                        (p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
                );
                return nameMatch || descMatch || addrMatch || productMatch;
            });
        }

        // Attach populated owner and calculated review stats
        return result
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((b) => {
                const stats = computeReviewStats(b._id);
                return {
                    ...b,
                    id: b.id || b._id,
                    owner: populateUser(b.owner),
                    averageRating: stats.averageRating,
                    reviewCount: stats.reviewCount
                };
            });
    },

    getBusinessById: (id) => {
        if (!id) return null;
        const b = businesses.find((item) => item._id.toString() === id.toString());
        if (!b) return null;

        const stats = computeReviewStats(b._id);
        const bizProducts = products
            .filter((p) => p.business.toString() === b._id.toString())
            .sort((x, y) => new Date(y.createdAt) - new Date(x.createdAt));
        const bizReviews = reviews
            .filter((r) => r.business.toString() === b._id.toString())
            .sort((x, y) => new Date(y.createdAt) - new Date(x.createdAt))
            .map((r) => ({
                ...r,
                id: r.id || r._id,
                user: populateUser(r.user)
            }));

        return {
            ...b,
            id: b.id || b._id,
            owner: populateUser(b.owner),
            averageRating: stats.averageRating,
            reviewCount: stats.reviewCount,
            products: bizProducts,
            reviews: bizReviews
        };
    },

    createBusiness: (data) => {
        const id = generateId("65f1");
        const newBiz = {
            _id: id,
            id,
            name: data.name.trim(),
            description: data.description.trim(),
            category: data.category,
            address: data.address.trim(),
            phone: data.phone.trim(),
            email: data.email.trim().toLowerCase(),
            owner: data.owner,
            image: data.image && data.image.trim() !== "" ? data.image.trim() : "",
            createdAt: new Date()
        };
        businesses.unshift(newBiz);
        return {
            ...newBiz,
            owner: populateUser(newBiz.owner),
            averageRating: 0,
            reviewCount: 0
        };
    },

    updateBusiness: (id, updates) => {
        const index = businesses.findIndex((b) => b._id.toString() === id.toString());
        if (index === -1) return null;

        businesses[index] = {
            ...businesses[index],
            ...updates,
            id: businesses[index].id || businesses[index]._id
        };

        const updated = businesses[index];
        const stats = computeReviewStats(updated._id);
        return {
            ...updated,
            owner: populateUser(updated.owner),
            averageRating: stats.averageRating,
            reviewCount: stats.reviewCount
        };
    },

    deleteBusiness: (id) => {
        const index = businesses.findIndex((b) => b._id.toString() === id.toString());
        if (index === -1) return false;

        // Cascade delete products & reviews for this business
        products = products.filter((p) => p.business.toString() !== id.toString());
        reviews = reviews.filter((r) => r.business.toString() !== id.toString());
        businesses.splice(index, 1);
        return true;
    },

    // ── PRODUCTS ─────────────────────────────────────────────
    getProducts: ({ category, type, search, business } = {}) => {
        let result = [...products];

        if (type && ["product", "service"].includes(type.toLowerCase())) {
            result = result.filter((p) => p.type === type.toLowerCase());
        }

        if (category && category !== "All") {
            const catLower = category.toLowerCase().trim();
            result = result.filter((p) => p.category.toLowerCase() === catLower);
        }

        if (business) {
            result = result.filter((p) => p.business.toString() === business.toString());
        }

        if (search && search.trim() !== "") {
            const q = search.toLowerCase().trim();
            result = result.filter(
                (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
            );
        }

        return result
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((p) => ({
                ...p,
                id: p.id || p._id,
                business: populateBusiness(p.business)
            }));
    },

    getProductById: (id) => {
        if (!id) return null;
        const p = products.find((item) => item._id.toString() === id.toString());
        if (!p) return null;
        return {
            ...p,
            id: p.id || p._id,
            business: populateBusiness(p.business)
        };
    },

    getBusinessProducts: (businessId) => {
        return products
            .filter((p) => p.business.toString() === businessId.toString())
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((p) => ({
                ...p,
                id: p.id || p._id
            }));
    },

    createProduct: (data) => {
        const id = generateId("65f2");
        const newProduct = {
            _id: id,
            id,
            name: data.name.trim(),
            description: data.description.trim(),
            price: Number(data.price),
            category: data.category.trim(),
            type: data.type || "product",
            business: data.business,
            image: data.image && data.image.trim() !== "" ? data.image.trim() : "",
            createdAt: new Date()
        };
        products.unshift(newProduct);
        return {
            ...newProduct,
            business: populateBusiness(newProduct.business)
        };
    },

    updateProduct: (id, updates) => {
        const index = products.findIndex((p) => p._id.toString() === id.toString());
        if (index === -1) return null;

        products[index] = {
            ...products[index],
            ...updates,
            id: products[index].id || products[index]._id
        };
        return {
            ...products[index],
            business: populateBusiness(products[index].business)
        };
    },

    deleteProduct: (id) => {
        const index = products.findIndex((p) => p._id.toString() === id.toString());
        if (index === -1) return false;
        products.splice(index, 1);
        return true;
    },

    // ── REVIEWS ──────────────────────────────────────────────
    getBusinessReviews: (businessId) => {
        const bizReviews = reviews
            .filter((r) => r.business.toString() === businessId.toString())
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((r) => ({
                ...r,
                id: r.id || r._id,
                user: populateUser(r.user)
            }));
        const stats = computeReviewStats(businessId);
        return {
            count: stats.reviewCount,
            averageRating: stats.averageRating,
            reviews: bizReviews
        };
    },

    getUserReviews: (userId) => {
        return reviews
            .filter((r) => r.user.toString() === userId.toString())
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((r) => ({
                ...r,
                id: r.id || r._id,
                business: populateBusiness(r.business)
            }));
    },

    getReviewById: (id) => {
        if (!id) return null;
        return reviews.find((r) => r._id.toString() === id.toString()) || null;
    },

    createOrUpdateReview: ({ businessId, userId, rating, comment }) => {
        const existingIndex = reviews.findIndex(
            (r) => r.business.toString() === businessId.toString() && r.user.toString() === userId.toString()
        );

        if (existingIndex !== -1) {
            reviews[existingIndex].rating = Number(rating);
            reviews[existingIndex].comment = comment.trim();
            reviews[existingIndex].updatedAt = new Date();
            const populated = {
                ...reviews[existingIndex],
                id: reviews[existingIndex].id || reviews[existingIndex]._id,
                user: populateUser(reviews[existingIndex].user)
            };
            return { review: populated, isNew: false };
        }

        const id = generateId("65f3");
        const newReview = {
            _id: id,
            id,
            user: userId,
            business: businessId,
            rating: Number(rating),
            comment: comment.trim(),
            createdAt: new Date()
        };
        reviews.unshift(newReview);
        const populated = {
            ...newReview,
            user: populateUser(newReview.user)
        };
        return { review: populated, isNew: true };
    },

    updateReview: (id, { rating, comment }) => {
        const index = reviews.findIndex((r) => r._id.toString() === id.toString());
        if (index === -1) return null;

        if (rating !== undefined) reviews[index].rating = Number(rating);
        if (comment) reviews[index].comment = comment.trim();
        reviews[index].updatedAt = new Date();

        return {
            ...reviews[index],
            id: reviews[index].id || reviews[index]._id,
            user: populateUser(reviews[index].user)
        };
    },

    deleteReview: (id) => {
        const index = reviews.findIndex((r) => r._id.toString() === id.toString());
        if (index === -1) return false;
        reviews.splice(index, 1);
        return true;
    }
};

module.exports = demoStore;
