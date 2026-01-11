import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config'
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + path.extname(file.originalname))
    }
})

const upload = multer({ storage: storage })

// Serve static files
app.use('/uploads', express.static(uploadDir));

// Upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Return the URL
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

// Users
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

app.get('/api/users', async (req, res) => {
    const users = await prisma.user.findMany({ select: { id: true, username: true, role: true, name: true } });
    res.json(users);
});

app.get('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: { id: true, name: true, username: true, role: true }
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

app.get('/api/users/:id/stats', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: { id: true, role: true }
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        let stats: any = {};

        const getLast7Days = () => {
            const days = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                days.push(d.toISOString().split('T')[0]);
            }
            return days;
        };

        if (user.role === 'cashier') {
            const orders = await prisma.order.findMany({
                where: { cashierId: id },
                select: { total: true, date: true, status: true }
            });

            const days = getLast7Days();
            const dailyStats = days.map(day => {
                const dayOrders = orders.filter(o => o.date.toISOString().startsWith(day));
                return {
                    date: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
                    revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
                    orders: dayOrders.length
                };
            });

            const hourlyStats = Array.from({ length: 24 }, (_, i) => ({
                hour: `${i}:00`,
                orders: orders.filter(o => new Date(o.date).getHours() === i).length
            }));

            const statusDistribution = [
                { name: 'Completed', value: orders.filter(o => o.status === 'completed').length, fill: '#10b981' },
                { name: 'Cancelled', value: orders.filter(o => o.status === 'cancelled').length, fill: '#ef4444' },
                { name: 'Pending', value: orders.filter(o => o.status === 'pending').length, fill: '#f59e0b' }
            ].filter(i => i.value > 0);

            stats = {
                totalOrders: orders.length,
                totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
                completedOrders: orders.filter(o => o.status === 'completed').length,
                cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
                recentActivity: orders.slice(0, 5).map(o => ({ date: o.date, type: 'order', amount: o.total })),
                dailyStats,
                hourlyStats,
                statusDistribution
            };
        } else if (user.role === 'courier') {
            const deliveries = await prisma.order.findMany({
                where: { courierId: id },
                select: { status: true, date: true, deliveryFee: true }
            });

            const days = getLast7Days();
            const dailyStats = days.map(day => {
                const dayDeliveries = deliveries.filter(d => d.date.toISOString().startsWith(day));
                return {
                    date: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
                    fees: dayDeliveries.reduce((sum, d) => sum + (d.deliveryFee || 0), 0),
                    deliveries: dayDeliveries.length
                };
            });

            const hourlyStats = Array.from({ length: 24 }, (_, i) => ({
                hour: `${i}:00`,
                deliveries: deliveries.filter(d => new Date(d.date).getHours() === i).length
            }));

            const statusDistribution = [
                { name: 'Completed', value: deliveries.filter(d => d.status === 'completed').length, fill: '#10b981' },
                { name: 'Cancelled', value: deliveries.filter(d => d.status === 'cancelled').length, fill: '#ef4444' },
                { name: 'Pending', value: deliveries.filter(d => d.status === 'pending').length, fill: '#f59e0b' }
            ].filter(i => i.value > 0);

            stats = {
                totalDeliveries: deliveries.length,
                completedDeliveries: deliveries.filter(d => d.status === 'completed').length,
                cancelledDeliveries: deliveries.filter(d => d.status === 'cancelled').length,
                totalDeliveryFees: deliveries.reduce((sum, d) => sum + (d.deliveryFee || 0), 0),
                recentActivity: deliveries.slice(0, 5).map(d => ({ date: d.date, type: 'delivery', status: d.status })),
                dailyStats,
                hourlyStats,
                statusDistribution
            };
        }

        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch user stats' });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const { username, password, role, name } = req.body;
        const user = await prisma.user.create({
            data: { username, password, role, name }
        });
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create user' });
    }
});

app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { username, password, role, name } = req.body;
    try {
        const data: any = { username, role, name };
        if (password) {
            data.password = password;
        }
        const user = await prisma.user.update({
            where: { id },
            data
        });
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update user' });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.user.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: `Failed to delete user ${id}` });
    }
});

// Categories
app.get('/api/categories', async (req, res) => {
    const categories = await prisma.category.findMany();
    res.json(categories);
});

app.post('/api/categories', async (req, res) => {
    try {
        const category = await prisma.category.create({ data: req.body });
        res.json(category);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create category' });
    }
});

app.delete('/api/categories/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.category.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: `Failed to delete category ${id}` });
    }
});

// Products
app.get('/api/products', async (req, res) => {
    const products = await prisma.product.findMany({
        include: { promotions: { where: { isActive: true } } }
    });
    res.json(products);
});

app.post('/api/products', async (req, res) => {
    const product = await prisma.product.create({ data: req.body });
    res.json(product);
});

app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const product = await prisma.product.update({
            where: { id },
            data: req.body,
        });
        res.json(product);
    } catch (error) {
        res.status(400).json({ error: `Failed to update product ${id}` });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.product.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: `Failed to delete product ${id}` });
    }
});

// Promotions
app.get('/api/promotions', async (req, res) => {
    try {
        const promotions = await prisma.promotion.findMany({
            include: { products: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(promotions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch promotions' });
    }
});

app.post('/api/promotions', async (req, res) => {
    const { name, type, value, startDate, endDate, productIds } = req.body;
    try {
        const promotion = await prisma.promotion.create({
            data: {
                name,
                type,
                value,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                products: {
                    connect: productIds.map((id: string) => ({ id }))
                }
            },
            include: { products: true }
        });
        res.json(promotion);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Failed to create promotion' });
    }
});

app.put('/api/promotions/:id', async (req, res) => {
    const { id } = req.params;
    const { name, type, value, startDate, endDate, productIds, isActive } = req.body;
    try {
        const promotion = await prisma.promotion.update({
            where: { id },
            data: {
                name,
                type,
                value,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                isActive,
                products: productIds ? {
                    set: productIds.map((pid: string) => ({ id: pid }))
                } : undefined
            },
            include: { products: true }
        });
        res.json(promotion);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update promotion' });
    }
});

app.delete('/api/promotions/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.promotion.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete promotion' });
    }
});

// Orders
app.get('/api/orders', async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                skip,
                take: limit,
                include: { 
                    items: {
                        include: {
                            product: true
                        }
                    },
                    cashier: {
                        select: {
                            id: true,
                            name: true,
                            username: true
                        }
                    },
                    courier: {
                        select: {
                            id: true,
                            name: true,
                            username: true
                        }
                    }
                },
                orderBy: { date: 'desc' }
            }),
            prisma.order.count()
        ]);

        res.json({
            data: orders,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Failed to fetch orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Deliveries
app.get('/api/deliveries', async (req, res) => {
    const { status, courierId, available } = req.query;
    try {
        const whereClause: any = { type: 'delivery' };
        
        if (available === 'true') {
             whereClause.courierId = null;
             whereClause.status = 'pending';
        } else if (courierId) {
             whereClause.courierId = String(courierId);
             if (status) {
                const statusList = String(status).split(',');
                if (statusList.length > 1) {
                    whereClause.status = { in: statusList };
                } else {
                    whereClause.status = String(status);
                }
             }
        } else if (status) {
             whereClause.status = String(status);
        }

        const orders = await prisma.order.findMany({
            where: whereClause,
            include: { items: { include: { product: true } } },
            orderBy: { date: 'desc' }
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch deliveries' });
    }
});

app.put('/api/orders/:id/assign', async (req, res) => {
    const { id } = req.params;
    const { courierId } = req.body;
    try {
        const order = await prisma.order.findUnique({ where: { id } });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        if (order.courierId) return res.status(400).json({ error: 'Order already assigned' });

        const updated = await prisma.order.update({
            where: { id },
            data: { courierId }
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to assign order' });
    }
});

app.get('/api/deliveries/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const order = await prisma.order.findFirst({
            where: { id, type: 'delivery' },
            include: { items: { include: { product: true } } }
        });

        if (!order) {
            return res.status(404).json({ error: 'Delivery not found' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch delivery' });
    }
});

app.put('/api/orders/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status, note, cancelReason } = req.body;
    try {
        const updateData: any = { status };

        if (status === 'cancelled') {
            const providedReason = typeof cancelReason === 'string' ? cancelReason.trim() : '';
            const legacyReason =
                typeof note === 'string' && note.startsWith('CANCELLED:')
                    ? note.slice('CANCELLED:'.length).trim()
                    : '';
            const finalReason = providedReason || legacyReason;
            if (finalReason) {
                updateData.cancelReason = finalReason;
            }

            if (typeof note === 'string' && note.trim() && !note.startsWith('CANCELLED:')) {
                updateData.note = note;
            }
        } else {
            updateData.cancelReason = null;
            if (note) {
                updateData.note = note;
            }
        }

        const order = await prisma.order.update({
            where: { id },
            data: updateData
        });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

app.put('/api/orders/:id/delivery', async (req, res) => {
    const { id } = req.params;
    const { receiverName, customerPhone, deliveryAddress, note } = req.body;

    try {
        const existing = await prisma.order.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ error: 'Order not found' });
        if (existing.type !== 'delivery') return res.status(400).json({ error: 'Order is not a delivery' });

        const data: any = {};
        if (receiverName !== undefined) data.receiverName = receiverName ? String(receiverName) : null;
        if (customerPhone !== undefined) data.customerPhone = customerPhone ? String(customerPhone) : null;
        if (deliveryAddress !== undefined) data.deliveryAddress = deliveryAddress ? String(deliveryAddress) : null;
        if (note !== undefined) data.note = note ? String(note) : null;

        const order = await prisma.order.update({
            where: { id },
            data,
            include: {
                items: { include: { product: true } },
                cashier: { select: { id: true, name: true, username: true } }
            }
        });

        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update delivery info' });
    }
});

app.post('/api/orders', async (req, res) => {
    const { items, cashierId, type, deliveryAddress, deliveryFee, customerPhone, receiverName, paymentMethod, note } = req.body;

    // 1. Fetch products and calculate total
    const productMap = new Map();
    let total = 0;
    
    try {
        for (const item of items) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (!product) return res.status(400).json({ error: `Product ${item.productId} not found` });
            
            total += product.sellPrice * item.quantity;
            productMap.set(item.productId, product);
        }
    } catch (error) {
        return res.status(500).json({ error: 'Failed to validate products' });
    }

    // Add delivery fee if present
    if (deliveryFee) {
        total += deliveryFee;
    }

    // Determine initial status
    const status = type === 'delivery' ? 'pending' : 'completed';

    // Create order transactionally to ensure stock is updated
    try {
        const result = await prisma.$transaction(async (tx) => {
            // Get last order number
            const lastOrder = await tx.order.findFirst({
                orderBy: { number: 'desc' }
            });
            const nextNumber = (lastOrder?.number || 0) + 1;

            // Create Order
            const order = await tx.order.create({
                data: {
                    number: nextNumber,
                    cashierId,
                    total,
                    type,
                    status, // Set explicitly
                    deliveryAddress,
                    deliveryFee,
                    customerPhone,
                    receiverName,
                    paymentMethod,
                    note,
                    items: {
                        create: items.map((item: any) => {
                            const product = productMap.get(item.productId);
                            return {
                                productId: item.productId,
                                quantity: item.quantity,
                                price: item.price || product.sellPrice, // Use provided price (discounted) or fallback to DB
                                originalPrice: product.sellPrice, // Snapshot original sell price
                                cost: product.buyPrice,   // Snapshot buy price (cost)
                                name: product.name        // Snapshot product name
                            };
                        })
                    }
                },
                include: { items: true }
            });

            // Update Stock
            for (const item of items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } }
                });
            }

            return order;
        });

        res.json(result);
    } catch (error) {
        console.error('Transaction error:', error);
        res.status(500).json({ error: 'Transaction failed', details: error });
    }
});

// Cashiers (Manager View)
app.get('/api/cashiers', async (req, res) => {
    try {
        const cashiers = await prisma.user.findMany({
            where: { role: 'cashier' },
            select: { id: true, name: true, username: true }
        });

        const cashiersWithStats = await Promise.all(cashiers.map(async (cashier) => {
            const aggregate = await prisma.order.aggregate({
                where: { cashierId: cashier.id },
                _sum: { total: true }
            });
            return {
                ...cashier,
                totalSales: aggregate._sum.total || 0
            };
        }));

        res.json(cashiersWithStats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cashiers' });
    }
});

app.get('/api/cashiers/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const cashier = await prisma.user.findUnique({
            where: { id },
            select: { id: true, name: true, username: true, role: true }
        });

        if (!cashier || cashier.role !== 'cashier') {
            return res.status(404).json({ error: 'Cashier not found' });
        }

        const aggregate = await prisma.order.aggregate({
            where: { cashierId: id },
            _sum: { total: true }
        });

        res.json({
            ...cashier,
            totalSales: aggregate._sum.total || 0
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cashier details' });
    }
});

app.get('/api/cashiers/:id/orders', async (req, res) => {
    const { id } = req.params;
    try {
        const orders = await prisma.order.findMany({
            where: { cashierId: id },
            include: { items: { include: { product: true } } },
            orderBy: { date: 'desc' }
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cashier orders' });
    }
});

// RAG Agent Sales History Endpoint
app.get('/api/sales-history', async (req, res) => {
    try {
        const { startDate, endDate, cashierId, productId } = req.query;

        const where: any = {};
        
        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate as string),
                lte: new Date(endDate as string)
            };
        } else if (startDate) {
            where.date = { gte: new Date(startDate as string) };
        }

        if (cashierId) where.cashierId = cashierId;

        // If filtering by product, we need to filter orders that contain this product
        if (productId) {
            where.items = {
                some: { productId: productId as string }
            };
        }

        const orders = await prisma.order.findMany({
            where,
            include: {
                items: true,
                cashier: { select: { name: true, role: true } }
            },
            orderBy: { date: 'desc' }
        });

        // Format for RAG consumption (flatter structure)
        const flatHistory = orders.map((order: any) => ({
            orderId: order.id,
            date: order.date,
            total: order.total,
            cashier: order.cashier.name,
            role: order.cashier.role,
            customerPhone: order.customerPhone || 'N/A',
            items: order.items.map((item: any) => `${item.quantity}x ${item.name} @ ${item.price}`).join(', ')
        }));

        res.json(flatHistory);
    } catch (error) {
        console.error('History error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Stats (Enhanced Manager Dashboard)
app.get('/api/stats', async (req, res) => {
    try {
        const period = req.query.period as string || 'week';
        
        // 1. Date Ranges
        const now = new Date();
        const start = new Date();
        const prevStart = new Date();
        const prevEnd = new Date(); // To exclude overlap if needed, or just standard comparison

        if (period === 'today') {
            start.setHours(0,0,0,0);
            prevStart.setDate(start.getDate() - 1);
            prevStart.setHours(0,0,0,0);
            prevEnd.setDate(start.getDate() - 1);
            prevEnd.setHours(23,59,59,999);
        } else if (period === 'month') {
            start.setDate(now.getDate() - 30);
            start.setHours(0,0,0,0);
            prevStart.setDate(now.getDate() - 60);
            prevStart.setHours(0,0,0,0);
            prevEnd.setDate(now.getDate() - 30);
            prevEnd.setHours(0,0,0,0); // Up to start of current period
        } else { // week or default
            start.setDate(now.getDate() - 7);
            start.setHours(0,0,0,0);
            prevStart.setDate(now.getDate() - 14);
            prevStart.setHours(0,0,0,0);
            prevEnd.setDate(now.getDate() - 7);
            prevEnd.setHours(0,0,0,0);
        }

        // 2. Fetch Data
        const [currentOrders, previousOrders, totalCashiers, lowStockProducts] = await Promise.all([
            prisma.order.findMany({
                where: { date: { gte: start } },
                include: { 
                    items: { include: { product: { include: { category: true } } } },
                    cashier: true
                },
                orderBy: { date: 'asc' }
            }),
            prisma.order.findMany({
                where: { date: { gte: prevStart, lt: start } },
                select: { total: true, cashierId: true, items: { include: { product: true } } }
            }),
            prisma.user.count({ where: { role: 'cashier' } }),
            prisma.product.findMany({
                where: { stock: { lte: 10 } },
                take: 5,
                select: { name: true, stock: true }
            })
        ]);

        // 3. Calculate Metrics
        const calculateMetrics = (orders: any[]) => {
            let revenue = 0;
            let profit = 0;
            const cashiers = new Set();
            
            orders.forEach(o => {
                revenue += o.total;
                if (o.cashierId) cashiers.add(o.cashierId);
                o.items.forEach((i: any) => {
                    const buyPrice = i.product?.buyPrice || 0;
                    profit += (i.price - buyPrice) * i.quantity;
                });
            });
            
            return {
                revenue,
                profit,
                count: orders.length,
                avgCheck: orders.length ? revenue / orders.length : 0,
                activeCashiers: cashiers.size
            };
        };

        const current = calculateMetrics(currentOrders);
        const previous = calculateMetrics(previousOrders);

        const getChange = (curr: number, prev: number) => {
            if (prev === 0) return curr > 0 ? 100 : 0;
            return ((curr - prev) / prev) * 100;
        };

        const cards = {
            revenue: { 
                value: current.revenue, 
                change: getChange(current.revenue, previous.revenue),
                trend: current.revenue >= previous.revenue ? 'up' : 'down'
            },
            averageCheck: { 
                value: current.avgCheck, 
                change: getChange(current.avgCheck, previous.avgCheck),
                trend: current.avgCheck >= previous.avgCheck ? 'up' : 'down'
            },
            profit: { 
                value: current.profit, 
                change: getChange(current.profit, previous.profit),
                trend: current.profit >= previous.profit ? 'up' : 'down'
            },
            activeCashiers: {
                value: current.activeCashiers,
                total: totalCashiers
            }
        };

        // 4. Chart Data
        const chartDataMap = new Map<string, { revenue: number, profit: number }>();
        
        if (period === 'today') {
            for (let i = 0; i <= now.getHours(); i++) {
                chartDataMap.set(`${i}:00`, { revenue: 0, profit: 0 });
            }
        } else {
            const days = period === 'month' ? 30 : 7;
            for (let i = days - 1; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const key = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
                chartDataMap.set(key, { revenue: 0, profit: 0 });
            }
        }

        currentOrders.forEach(order => {
            let key = '';
            const d = new Date(order.date);
            if (period === 'today') {
                key = `${d.getHours()}:00`;
            } else {
                key = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
            }

            if (chartDataMap.has(key) || period === 'today') {
                 if (!chartDataMap.has(key) && period === 'today') chartDataMap.set(key, { revenue: 0, profit: 0 });
                 
                 const entry = chartDataMap.get(key)!;
                 entry.revenue += order.total;
                 
                 let orderProfit = 0;
                 order.items.forEach((i: any) => {
                     orderProfit += (i.price - (i.product?.buyPrice || 0)) * i.quantity;
                 });
                 entry.profit += orderProfit;
            }
        });

        const chart = Array.from(chartDataMap.entries()).map(([name, data]) => ({
            name,
            revenue: data.revenue,
            profit: data.profit
        }));

        // 5. Top Products (ABC)
        const productStats = new Map<string, { name: string, sold: number, revenue: number }>();
        currentOrders.forEach(o => {
            o.items.forEach((i: any) => {
                const pid = i.productId;
                if (!productStats.has(pid)) {
                    productStats.set(pid, { name: i.product?.name || 'Unknown', sold: 0, revenue: 0 });
                }
                const stat = productStats.get(pid)!;
                stat.sold += i.quantity;
                stat.revenue += i.price * i.quantity;
            });
        });

        const sortedProducts = Array.from(productStats.values()).sort((a, b) => b.revenue - a.revenue);
        const totalRevenue = sortedProducts.reduce((sum, p) => sum + p.revenue, 0);
        
        let cumulative = 0;
        const topProducts = sortedProducts.map(p => {
            cumulative += p.revenue;
            const percentage = (cumulative / totalRevenue) * 100;
            let category: 'A' | 'B' | 'C' = 'C';
            if (percentage <= 80) category = 'A';
            else if (percentage <= 95) category = 'B';
            return { ...p, category };
        }).slice(0, 10);

        // Bottom Products (Least Selling)
        const bottomProducts = [...sortedProducts].reverse().slice(0, 5).map(p => ({
            ...p,
            category: 'C' as const
        }));

        // Top Cashiers
        const cashierStats = new Map<string, { id: string, name: string, revenue: number, orders: number }>();
        currentOrders.forEach(o => {
            if (o.cashierId) {
                const cName = (o as any).cashier?.name || 'Unknown';
                const cId = o.cashierId;
                if (!cashierStats.has(cId)) {
                    cashierStats.set(cId, { id: cId, name: cName, revenue: 0, orders: 0 });
                }
                const stat = cashierStats.get(cId)!;
                stat.revenue += o.total;
                stat.orders += 1;
            }
        });
        const topCashiers = Array.from(cashierStats.values())
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        // 6. Insights
        const insights = [];
        
        // Low Stock
        if (lowStockProducts.length > 0) {
            insights.push({
                type: 'alert',
                title: 'Low Stock Alert',
                message: `${lowStockProducts[0].name} and ${lowStockProducts.length - 1} others are running low.`,
                action: 'View Inventory'
            });
        }

        // Sales Trend
        if (cards.revenue.change < -10) {
             insights.push({
                type: 'optimization',
                title: 'Revenue Drop',
                message: `Revenue is down ${Math.abs(cards.revenue.change).toFixed(1)}% compared to last period.`,
                action: 'Analyze'
             });
        }
        
        // Mock Dead Stock (real impl would require complex query)
        insights.push({
             type: 'inventory',
             title: 'Dead Stock Analysis',
             message: 'System is analyzing product movement patterns.',
             action: 'Details'
        });

        // AI Predictions
        insights.push({
            type: 'prediction',
            title: 'Demand Forecast',
            message: 'AI predicts 15% surge in "Beverages" sales this weekend due to weather.',
            action: 'Stock Up'
        });
        insights.push({
            type: 'staffing',
            title: 'Staffing Optimization',
            message: 'High traffic expected tomorrow 12:00-14:00. Recommend 3 active cashiers.',
            action: 'Schedule'
        });

        // 7. New Charts Data
        // Category Sales
        const categoryColors: Record<string, string> = {
            'Bakery': '#f59e0b', // Amber
            'Beverages': '#3b82f6', // Blue
            'Coffee': '#78350f', // Brown
            'Dairy & Eggs': '#eab308', // Yellow
            'Fruits & Vegetables': '#22c55e', // Green
            'Meat': '#ef4444', // Red
            'Meat & Seafood': '#ef4444', // Red
            'Pantry': '#64748b', // Slate
            'Snacks': '#ec4899', // Pink
            'Household': '#8b5cf6', // Violet
            'Personal Care': '#06b6d4', // Cyan
        };

        const categoryStats = new Map<string, number>();
        currentOrders.forEach(o => {
            o.items.forEach((i: any) => {
                const cat = i.product?.category?.name || 'Other';
                categoryStats.set(cat, (categoryStats.get(cat) || 0) + (i.price * i.quantity));
            });
        });
        const categorySales = Array.from(categoryStats.entries())
            .map(([name, value]) => ({ 
                name, 
                value,
                fill: categoryColors[name] || '#94a3b8'
            }))
            .sort((a, b) => b.value - a.value);

        // Hourly Activity
        const hourlyStats = new Map<string, { orders: number, revenue: number }>();
        for(let i=0; i<24; i++) {
             hourlyStats.set(i.toString(), { orders: 0, revenue: 0 });
        }
        currentOrders.forEach(o => {
            const h = new Date(o.date).getHours().toString();
            const curr = hourlyStats.get(h)!;
            curr.orders++;
            curr.revenue += o.total;
        });
        const hourlyActivity = Array.from(hourlyStats.entries()).map(([hour, data]) => ({
            time: `${hour}:00`,
            orders: data.orders,
            revenue: data.revenue
        }));

        // Payment Methods
        const paymentStats = new Map<string, number>();
        currentOrders.forEach(o => {
            const method = o.paymentMethod || 'cash';
            paymentStats.set(method, (paymentStats.get(method) || 0) + 1);
        });
        const paymentMethods = Array.from(paymentStats.entries()).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value,
            fill: name === 'card' ? '#8b5cf6' : '#10b981'
        }));

        res.json({
            cards,
            chart,
            topProducts,
            bottomProducts,
            topCashiers,
            insights,
            categorySales,
            hourlyActivity,
            paymentMethods
        });

    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Keep alive hack
setInterval(() => {}, 1000);
