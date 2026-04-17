import { Product, Sale, Customer } from '../../domain/entities';

const now = new Date();
const yesterday = new Date(now.getTime() - 86400000);
const twoDaysAgo = new Date(now.getTime() - 2 * 86400000);

// ========== MOCK PRODUCTS ==========
export const mockProducts: Product[] = [
  {
    id: 'p1', name: 'Coca-Cola 600ml', description: 'Refresco de cola 600ml botella pet',
    price: 18, cost: 10, stock: 48, minStock: 12, category: 'Bebidas',
    barcode: '7501055300006', unit: 'pieza', taxRate: 0, isActive: true,
    createdAt: twoDaysAgo, updatedAt: twoDaysAgo,
  },
  {
    id: 'p2', name: 'Agua Natural 1L', description: 'Agua purificada 1 litro',
    price: 12, cost: 6, stock: 72, minStock: 24, category: 'Bebidas',
    barcode: '7502004830011', unit: 'pieza', taxRate: 0, isActive: true,
    createdAt: twoDaysAgo, updatedAt: twoDaysAgo,
  },
  {
    id: 'p3', name: 'Sabritas Originales 45g', description: 'Papas fritas sal',
    price: 16, cost: 9, stock: 5, minStock: 10, category: 'Alimentos',
    barcode: '7501032300051', unit: 'pieza', taxRate: 0.08, isActive: true,
    createdAt: twoDaysAgo, updatedAt: twoDaysAgo,
  },
  {
    id: 'p4', name: 'Pan Bimbo Blanco', description: 'Pan de caja blanco 680g',
    price: 48, cost: 32, stock: 15, minStock: 8, category: 'Alimentos',
    barcode: '7501000112121', unit: 'pieza', taxRate: 0, isActive: true,
    createdAt: twoDaysAgo, updatedAt: twoDaysAgo,
  },
  {
    id: 'p5', name: 'Leche Lala Entera 1L', description: 'Leche entera pasteurizada',
    price: 26, cost: 18, stock: 30, minStock: 12, category: 'Alimentos',
    barcode: '7501014000012', unit: 'pieza', taxRate: 0, isActive: true,
    createdAt: twoDaysAgo, updatedAt: twoDaysAgo,
  },
  {
    id: 'p6', name: 'Jabón Dove Original', description: 'Jabón de tocador 90g',
    price: 32, cost: 20, stock: 3, minStock: 6, category: 'Higiene',
    barcode: '7501016313079', unit: 'pieza', taxRate: 0.16, isActive: true,
    createdAt: twoDaysAgo, updatedAt: twoDaysAgo,
  },
  {
    id: 'p7', name: 'Detergente Ariel 1kg', description: 'Detergente en polvo para ropa',
    price: 65, cost: 45, stock: 20, minStock: 5, category: 'Hogar',
    barcode: '7501007000054', unit: 'pieza', taxRate: 0.16, isActive: true,
    createdAt: twoDaysAgo, updatedAt: twoDaysAgo,
  },
  {
    id: 'p8', name: 'Jugo Jumex Mango 1L', description: 'Bebida de mango con pulpa',
    price: 22, cost: 14, stock: 24, minStock: 8, category: 'Bebidas',
    barcode: '7501000501112', unit: 'pieza', taxRate: 0, isActive: true,
    createdAt: twoDaysAgo, updatedAt: twoDaysAgo,
  },
  {
    id: 'p9', name: 'Atún Clemente Jacques 140g', description: 'Atún en agua lata',
    price: 22, cost: 14, stock: 36, minStock: 10, category: 'Alimentos',
    barcode: '7501055400016', unit: 'pieza', taxRate: 0, isActive: true,
    createdAt: twoDaysAgo, updatedAt: twoDaysAgo,
  },
  {
    id: 'p10', name: 'Galletas Oreo 119g', description: 'Galletas de chocolate con crema',
    price: 28, cost: 18, stock: 18, minStock: 6, category: 'Alimentos',
    barcode: '7622300153014', unit: 'pieza', taxRate: 0.08, isActive: true,
    createdAt: twoDaysAgo, updatedAt: twoDaysAgo,
  },
  {
    id: 'p11', name: 'Cereal Kelloggs Corn Flakes', description: 'Cereal de maíz 500g',
    price: 55, cost: 38, stock: 12, minStock: 4, category: 'Alimentos',
    barcode: '7501008000136', unit: 'pieza', taxRate: 0, isActive: true,
    createdAt: twoDaysAgo, updatedAt: twoDaysAgo,
  },
  {
    id: 'p12', name: 'Papel Higiénico Kleenex x4', description: 'Papel higiénico 4 rollos doble hoja',
    price: 42, cost: 28, stock: 2, minStock: 6, category: 'Higiene',
    barcode: '7501019002340', unit: 'paquete', taxRate: 0, isActive: true,
    createdAt: twoDaysAgo, updatedAt: twoDaysAgo,
  },
];

// ========== MOCK CUSTOMERS ==========
export const mockCustomers: Customer[] = [
  {
    id: 'c1', name: 'María García', email: 'maria@gmail.com', phone: '555-1234',
    totalPurchases: 24, totalSpent: 1840, lastPurchaseAt: yesterday,
    createdAt: twoDaysAgo, notes: 'Cliente frecuente. Prefiere pagar en efectivo.',
  },
  {
    id: 'c2', name: 'Carlos Rodríguez', phone: '555-5678',
    totalPurchases: 8, totalSpent: 620, lastPurchaseAt: twoDaysAgo,
    createdAt: twoDaysAgo,
  },
  {
    id: 'c3', name: 'Ana López', email: 'ana.lopez@hotmail.com', phone: '555-9012',
    totalPurchases: 42, totalSpent: 3200, lastPurchaseAt: now,
    createdAt: twoDaysAgo, notes: 'Pide factura siempre.',
  },
  {
    id: 'c4', name: 'Jorge Martínez', phone: '555-3456',
    totalPurchases: 3, totalSpent: 180,
    createdAt: twoDaysAgo,
  },
];

// ========== MOCK SALES (last 7 days) ==========
function makeSale(id: string, daysAgo: number, hourOffset: number, items: { pid: string; qty: number }[], method: 'cash' | 'card' | 'transfer'): Sale {
  const date = new Date(now.getTime() - daysAgo * 86400000);
  date.setHours(9 + hourOffset, Math.floor(Math.random() * 60), 0, 0);

  const cartItems = items.map(({ pid, qty }) => {
    const product = mockProducts.find(p => p.id === pid)!;
    return { product, quantity: qty, subtotal: product.price * qty, discount: 0 };
  });

  const subtotal = cartItems.reduce((s, i) => s + i.subtotal, 0);
  const tax = cartItems.reduce((s, i) => s + i.subtotal * i.product.taxRate, 0);
  const total = subtotal + tax;
  const amountPaid = method === 'cash' ? Math.ceil(total / 10) * 10 + 20 : total;

  return {
    id, items: cartItems, subtotal, tax, discount: 0, total,
    paymentMethod: method, amountPaid, change: Math.max(0, amountPaid - total),
    status: 'completed', createdAt: date, ticketNumber: `T-${id.toUpperCase()}`,
  };
}

export const mockSales: Sale[] = [
  makeSale('s001', 0, 0, [{ pid: 'p1', qty: 2 }, { pid: 'p3', qty: 1 }], 'cash'),
  makeSale('s002', 0, 1, [{ pid: 'p4', qty: 1 }, { pid: 'p5', qty: 2 }], 'card'),
  makeSale('s003', 0, 2, [{ pid: 'p2', qty: 4 }, { pid: 'p10', qty: 1 }], 'cash'),
  makeSale('s004', 0, 3, [{ pid: 'p7', qty: 1 }, { pid: 'p6', qty: 2 }], 'transfer'),
  makeSale('s005', 0, 4, [{ pid: 'p1', qty: 1 }, { pid: 'p8', qty: 1 }, { pid: 'p3', qty: 2 }], 'cash'),
  makeSale('s006', 1, 0, [{ pid: 'p9', qty: 3 }, { pid: 'p11', qty: 1 }], 'card'),
  makeSale('s007', 1, 2, [{ pid: 'p1', qty: 3 }, { pid: 'p2', qty: 2 }], 'cash'),
  makeSale('s008', 2, 1, [{ pid: 'p4', qty: 2 }, { pid: 'p5', qty: 1 }], 'cash'),
  makeSale('s009', 2, 4, [{ pid: 'p10', qty: 2 }, { pid: 'p3', qty: 1 }], 'card'),
  makeSale('s010', 3, 2, [{ pid: 'p1', qty: 5 }], 'cash'),
  makeSale('s011', 3, 5, [{ pid: 'p7', qty: 1 }, { pid: 'p12', qty: 1 }], 'transfer'),
  makeSale('s012', 4, 0, [{ pid: 'p8', qty: 2 }, { pid: 'p9', qty: 1 }], 'card'),
  makeSale('s013', 5, 3, [{ pid: 'p6', qty: 1 }, { pid: 'p5', qty: 2 }, { pid: 'p4', qty: 1 }], 'cash'),
  makeSale('s014', 6, 1, [{ pid: 'p2', qty: 6 }, { pid: 'p1', qty: 2 }], 'cash'),
];

// ========== AI RECOMMENDATION MAP ==========
export const mockRecommendations: Record<string, string[]> = {
  'p1': ['p3', 'p8', 'p10'],   // Coca-Cola → chips, jugo, galletas
  'p2': ['p4', 'p5', 'p9'],    // Agua → pan, leche, atún
  'p3': ['p1', 'p8', 'p10'],   // Chips → refrescos
  'p4': ['p5', 'p9', 'p2'],    // Pan → leche, atún
  'p5': ['p4', 'p11', 'p9'],   // Leche → pan, cereal
  'p6': ['p7', 'p12'],         // Jabón → detergente, papel
  'p7': ['p6', 'p12'],         // Detergente → jabón
  'p8': ['p1', 'p3'],          // Jugo → refresco
  'p9': ['p4', 'p2'],          // Atún → pan
  'p10': ['p1', 'p8'],         // Galletas → bebidas
  'p11': ['p5'],               // Cereal → leche
  'p12': ['p6', 'p7'],         // Papel → higiene
};

// ========== FAQ DATA ==========
export const mockFAQ = [
  {
    id: 'f1',
    question: '¿Cómo agrego un producto nuevo al inventario?',
    answer: 'Ve a la sección Inventario → toca el botón "+" en la parte superior. Llena el nombre, precio, stock y categoría. Puedes escanear el código de barras automáticamente.',
  },
  {
    id: 'f2',
    question: '¿Cómo proceso una venta?',
    answer: 'Toca "Nueva Venta" en el Dashboard. Busca o escanea productos para agregarlos al carrito. Cuando estés listo, toca "Cobrar" y selecciona el método de pago.',
  },
  {
    id: 'f3',
    question: '¿Puedo emitir tickets digitales?',
    answer: 'Sí. Después de confirmar el pago, puedes compartir el ticket por WhatsApp, correo o imprimirlo si tienes una impresora compatible.',
  },
  {
    id: 'f4',
    question: '¿Cómo veo los reportes de ventas?',
    answer: 'Ve a la sección Reportes en el menú inferior. Ahí encontrarás ventas del día, semana y mes, así como los productos más vendidos.',
  },
  {
    id: 'f5',
    question: '¿Qué hago si un producto tiene stock incorrecto?',
    answer: 'En Inventario, toca el producto y selecciona "Ajustar stock". Puedes ingresar la cantidad correcta manualmente.',
  },
  {
    id: 'f6',
    question: '¿Cómo agrego un cliente?',
    answer: 'Ve a la sección Clientes → toca "+". O durante una venta, toca "Seleccionar cliente" → "Nuevo cliente".',
  },
];

// ========== CHATBOT RESPONSES ==========
export const chatbotResponses: { triggers: string[]; response: string }[] = [
  { triggers: ['hola', 'hi', 'buenos días', 'buenas', 'hey'], response: '¡Hola! Soy el asistente de TIVO. ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre ventas, inventario, reportes o cualquier función del app.' },
  { triggers: ['venta', 'vender', 'cobrar', 'cobro'], response: 'Para iniciar una venta, ve al Dashboard y toca "Nueva Venta". Luego busca o escanea los productos. Cuando termines, toca "Cobrar" y elige el método de pago.' },
  { triggers: ['inventario', 'producto', 'stock'], response: 'Puedes gestionar tu inventario en la sección "Inventario". Ahí puedes agregar productos, editar precios y ajustar el stock. Los productos con stock bajo aparecen resaltados.' },
  { triggers: ['reporte', 'ventas del día', 'estadística', 'analytics'], response: 'Los reportes están en la sección "Reportes". Verás las ventas del día, semana y mes, así como los productos más vendidos y gráficas de rendimiento.' },
  { triggers: ['cliente', 'comprador'], response: 'Administra tus clientes en la sección "Clientes". Puedes registrar su nombre, teléfono y email, y ver su historial de compras.' },
  { triggers: ['pago', 'efectivo', 'tarjeta', 'transferencia'], response: 'TIVO acepta 3 métodos de pago: Efectivo (calculamos el cambio automáticamente), Tarjeta y Transferencia bancaria.' },
  { triggers: ['gracias', 'ok', 'entendido', 'listo'], response: '¡De nada! Si tienes más preguntas, aquí estoy. 😊' },
  { triggers: ['problema', 'error', 'falla', 'bug', 'ayuda', 'soporte'], response: 'Lamentamos el inconveniente. Puedes crear un ticket de soporte tocando "Crear ticket" más abajo, y nuestro equipo lo atenderá en menos de 24 horas.' },
];
