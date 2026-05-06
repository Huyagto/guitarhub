'use strict';

const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { PrismaClient } = require('../generated/prisma/index.js');
const { hashPassword } = require('../core/utils');
const { roles } = require('../modules/auth/constants');

const prisma = new PrismaClient();

const BRANCHES = [
    {
        code: 'VVO',
        name: 'SC VivoCity',
        address: '1058 Nguyễn Văn Linh, phường Tân Phong, Quận 7, TP.HCM',
        phone: '02873010001',
        latitude: 10.7293,
        longitude: 106.7038,
    },
    {
        code: 'VHM',
        name: 'Vạn Hạnh Mall',
        address: '11 Sư Vạn Hạnh, phường 12, Quận 10, TP.HCM',
        phone: '02873010002',
        latitude: 10.7702,
        longitude: 106.6706,
    },
    {
        code: 'SCN',
        name: 'Saigon Centre',
        address: '65 Lê Lợi, phường Bến Nghé, Quận 1, TP.HCM',
        phone: '02873010003',
        latitude: 10.7733,
        longitude: 106.7009,
    },
    {
        code: 'VTD',
        name: 'Vincom Mega Mall Thảo Điền',
        address: '161 Xa Lộ Hà Nội, phường Thảo Điền, TP. Thủ Đức, TP.HCM',
        phone: '02873010004',
        latitude: 10.8017,
        longitude: 106.7407,
    },
    {
        code: 'ATP',
        name: 'AEON Mall Tân Phú Celadon',
        address: '30 Bờ Bao Tân Thắng, phường Sơn Kỳ, quận Tân Phú, TP.HCM',
        phone: '02873010005',
        latitude: 10.8015,
        longitude: 106.6188,
    },
    {
        code: 'GGM',
        name: 'Giga Mall Thủ Đức',
        address: '240-242 Phạm Văn Đồng, phường Hiệp Bình Chánh, TP. Thủ Đức, TP.HCM',
        phone: '02873010006',
        latitude: 10.8278,
        longitude: 106.7210,
    },
    {
        code: 'CRM',
        name: 'Crescent Mall',
        address: '101 Tôn Dật Tiên, phường Tân Phú, Quận 7, TP.HCM',
        phone: '02873010007',
        latitude: 10.7291,
        longitude: 106.7186,
    },
    {
        code: 'PPZ',
        name: 'Pearl Plaza',
        address: '561A Điện Biên Phủ, phường 25, quận Bình Thạnh, TP.HCM',
        phone: '02873010008',
        latitude: 10.8006,
        longitude: 106.7182,
    },
];

const USERS = [
    {
        email: 'customer@guitarhub.vn',
        password: 'Customer@123',
        fullName: 'Khách hàng mẫu',
        phone: '0909000001',
        role: roles.CUSTOMER,
    },
    {
        email: 'manager@guitarhub.vn',
        password: 'Manager@123',
        fullName: 'Quản lý GuitarHub',
        phone: '0909000002',
        role: roles.MANAGER,
        staffCode: '0100001',
    },
    {
        email: 'staff.vvo@guitarhub.vn',
        password: 'Staff@123',
        fullName: 'Nhân viên SC VivoCity',
        phone: '0909000101',
        role: roles.STAFF,
        staffCode: '0100101',
        branchCode: 'VVO',
    },
    {
        email: 'staff.vhm@guitarhub.vn',
        password: 'Staff@123',
        fullName: 'Nhân viên Vạn Hạnh Mall',
        phone: '0909000102',
        role: roles.STAFF,
        staffCode: '0100102',
        branchCode: 'VHM',
    },
    {
        email: 'staff.scn@guitarhub.vn',
        password: 'Staff@123',
        fullName: 'Nhân viên Saigon Centre',
        phone: '0909000103',
        role: roles.STAFF,
        staffCode: '0100103',
        branchCode: 'SCN',
    },
];

const CATEGORIES = [
    {
        name: 'Guitar Acoustic',
        slug: 'acoustic-guitar',
        description: 'Guitar acoustic cho luyện tập, biểu diễn và thu âm.',
        image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=600&fit=crop',
        status: 'ACTIVE',
    },
    {
        name: 'Guitar Electric',
        slug: 'electric-guitar',
        description: 'Guitar điện cho nhiều phong cách từ pop, blues đến rock.',
        image: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=800&h=600&fit=crop',
        status: 'ACTIVE',
    },
    {
        name: 'Bass Guitar',
        slug: 'bass-guitar',
        description: 'Bass guitar cho học tập, sân khấu và phòng thu.',
        image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=600&fit=crop',
        status: 'ACTIVE',
    },
    {
        name: 'Phụ kiện',
        slug: 'accessories',
        description: 'Phụ kiện guitar, dây đàn, pick, capo và thiết bị hỗ trợ.',
        image: 'https://images.unsplash.com/photo-1520166012956-add9ba0835cb1?w=800&h=600&fit=crop',
        status: 'ACTIVE',
    },
];

const BRANDS = [
    {
        name: 'Taylor',
        slug: 'taylor',
        description: 'Thương hiệu guitar acoustic cao cấp.',
        logo: null,
        status: 'ACTIVE',
    },
    {
        name: 'Fender',
        slug: 'fender',
        description: 'Thương hiệu nổi tiếng với guitar điện và bass.',
        logo: null,
        status: 'ACTIVE',
    },
    {
        name: 'Yamaha',
        slug: 'yamaha',
        description: 'Thương hiệu phổ biến cho guitar và nhạc cụ học tập.',
        logo: null,
        status: 'ACTIVE',
    },
    {
        name: 'Ibanez',
        slug: 'ibanez',
        description: 'Thương hiệu dành cho rock, metal và guitar hiệu năng cao.',
        logo: null,
        status: 'ACTIVE',
    },
    {
        name: 'Dunlop',
        slug: 'dunlop',
        description: 'Phụ kiện và thiết bị hỗ trợ cho guitar.',
        logo: null,
        status: 'ACTIVE',
    },
];

const PRODUCTS = [
    {
        name: 'Taylor 214ce',
        slug: 'taylor-214ce',
        sku: 'TAY-214CE',
        categorySlug: 'acoustic-guitar',
        brandSlug: 'taylor',
        price: 24500000,
        minStock: 2,
        maxStock: 12,
        image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=800&fit=crop',
        shortDescription: 'Mẫu acoustic cân bằng tốt cho biểu diễn.',
        description: 'Taylor 214ce phù hợp cho người chơi cần âm thanh sáng, dễ chơi và hoàn thiện đẹp.',
        status: 'ACTIVE',
        isBestSeller: true,
        isNewArrival: false,
        rating: 4.8,
        reviewCount: 124,
        inventory: { VVO: 2, VHM: 1, SCN: 2, VTD: 1, ATP: 1, GGM: 0, CRM: 1, PPZ: 0 },
    },
    {
        name: 'Taylor GS Mini',
        slug: 'taylor-gs-mini',
        sku: 'TAY-GS-MINI',
        categorySlug: 'acoustic-guitar',
        brandSlug: 'taylor',
        price: 17900000,
        minStock: 2,
        maxStock: 14,
        image: 'https://images.unsplash.com/photo-1514119412350-e174d90d280e?w=800&h=800&fit=crop',
        shortDescription: 'Mẫu guitar nhỏ gọn dễ mang đi và luyện tập.',
        description: 'Taylor GS Mini cho âm thanh đầy đặn, dáng nhỏ gọn và rất phù hợp cho người đi diễn hoặc du lịch.',
        status: 'ACTIVE',
        isBestSeller: true,
        isNewArrival: true,
        rating: 4.7,
        reviewCount: 91,
        inventory: { VVO: 3, VHM: 2, SCN: 2, VTD: 1, ATP: 2, GGM: 1, CRM: 2, PPZ: 1 },
    },
    {
        name: 'Fender Player Stratocaster',
        slug: 'fender-player-stratocaster',
        sku: 'FEN-PLAYER-STRAT',
        categorySlug: 'electric-guitar',
        brandSlug: 'fender',
        price: 21990000,
        minStock: 2,
        maxStock: 12,
        image: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=800&h=800&fit=crop',
        shortDescription: 'Mẫu Stratocaster phổ biến cho nhiều dòng nhạc.',
        description: 'Fender Player Stratocaster cho cảm giác chơi tốt, âm thanh linh hoạt và phù hợp sân khấu.',
        status: 'ACTIVE',
        isBestSeller: true,
        isNewArrival: true,
        rating: 4.9,
        reviewCount: 156,
        inventory: { VVO: 2, VHM: 2, SCN: 3, VTD: 1, ATP: 1, GGM: 2, CRM: 1, PPZ: 0 },
    },
    {
        name: 'Ibanez RG550',
        slug: 'ibanez-rg550',
        sku: 'IBA-RG550',
        categorySlug: 'electric-guitar',
        brandSlug: 'ibanez',
        price: 28900000,
        minStock: 1,
        maxStock: 8,
        image: 'https://images.unsplash.com/photo-1543062094-d22540a39c1c?w=800&h=800&fit=crop',
        shortDescription: 'Mẫu electric guitar hiệu năng cao cho rock và metal.',
        description: 'Ibanez RG550 nổi bật với cần mỏng, tốc độ nhanh và pickup mạnh mẽ dành cho sân khấu.',
        status: 'ACTIVE',
        isBestSeller: false,
        isNewArrival: true,
        rating: 4.8,
        reviewCount: 63,
        inventory: { VVO: 1, VHM: 1, SCN: 2, VTD: 1, ATP: 0, GGM: 1, CRM: 1, PPZ: 0 },
    },
    {
        name: 'Yamaha TRBX174',
        slug: 'yamaha-trbx174',
        sku: 'YAM-TRBX174',
        categorySlug: 'bass-guitar',
        brandSlug: 'yamaha',
        price: 7990000,
        minStock: 3,
        maxStock: 18,
        image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=800&fit=crop',
        shortDescription: 'Mẫu bass guitar dễ tiếp cận cho người mới bắt đầu.',
        description: 'Yamaha TRBX174 cung cấp âm bass chắc, dễ đánh và độ bền cao cho nhu cầu học tập và biểu diễn.',
        status: 'ACTIVE',
        isBestSeller: false,
        isNewArrival: false,
        rating: 4.6,
        reviewCount: 44,
        inventory: { VVO: 3, VHM: 2, SCN: 2, VTD: 2, ATP: 3, GGM: 2, CRM: 2, PPZ: 1 },
    },
    {
        name: 'Yamaha F310',
        slug: 'yamaha-f310',
        sku: 'YAM-F310',
        categorySlug: 'acoustic-guitar',
        brandSlug: 'yamaha',
        price: 3490000,
        minStock: 5,
        maxStock: 35,
        image: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=800&h=800&fit=crop',
        shortDescription: 'Mẫu acoustic phổ thông phù hợp cho học viên và người mới.',
        description: 'Yamaha F310 là lựa chọn cân bằng giữa giá thành, độ bền và chất âm dễ nghe.',
        status: 'ACTIVE',
        isBestSeller: true,
        isNewArrival: false,
        rating: 4.5,
        reviewCount: 188,
        inventory: { VVO: 8, VHM: 6, SCN: 5, VTD: 5, ATP: 9, GGM: 7, CRM: 6, PPZ: 4 },
    },
    {
        name: 'Dunlop Tortex Pick Pack',
        slug: 'dunlop-tortex-pick-pack',
        sku: 'DUN-TORTEX-PICK',
        categorySlug: 'accessories',
        brandSlug: 'dunlop',
        price: 99000,
        minStock: 20,
        maxStock: 120,
        image: 'https://images.unsplash.com/photo-1520166012956-add9ba0835cb?w=800&h=800&fit=crop',
        shortDescription: 'Bộ pick phổ biến cho người chơi guitar.',
        description: 'Bộ pick Dunlop Tortex mang lại độ bám tốt và nhiều lựa chọn độ dày.',
        status: 'ACTIVE',
        isBestSeller: false,
        isNewArrival: true,
        rating: 4.7,
        reviewCount: 72,
        inventory: { VVO: 35, VHM: 28, SCN: 30, VTD: 22, ATP: 40, GGM: 25, CRM: 24, PPZ: 18 },
    },
    {
        name: 'Capo Acoustic Pro',
        slug: 'capo-acoustic-pro',
        sku: 'ACC-CAPO-PRO',
        categorySlug: 'accessories',
        brandSlug: 'dunlop',
        price: 250000,
        minStock: 8,
        maxStock: 60,
        image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&h=800&fit=crop',
        shortDescription: 'Capo gọn nhẹ, kẹp chắc và dễ thao tác.',
        description: 'Capo Acoustic Pro phù hợp cho biểu diễn nhanh, giúp chuyển tone ổn định và không rè dây.',
        status: 'ACTIVE',
        isBestSeller: false,
        isNewArrival: false,
        rating: 4.4,
        reviewCount: 21,
        inventory: { VVO: 12, VHM: 9, SCN: 10, VTD: 8, ATP: 14, GGM: 9, CRM: 8, PPZ: 6 },
    },
];

const getTotalStock = (inventory) =>
    Object.values(inventory || {}).reduce((sum, stock) => sum + Number(stock || 0), 0);

const seedBranches = async () => {
    await prisma.branch.deleteMany({
        where: { code: 'MAIN' },
    });

    for (const branch of BRANCHES) {
        await prisma.branch.upsert({
            where: { code: branch.code },
            update: {
                name: branch.name,
                address: branch.address,
                phone: branch.phone,
                latitude: branch.latitude,
                longitude: branch.longitude,
                status: 'ACTIVE',
            },
            create: {
                code: branch.code,
                name: branch.name,
                address: branch.address,
                phone: branch.phone,
                latitude: branch.latitude,
                longitude: branch.longitude,
                status: 'ACTIVE',
            },
        });

        console.log(`Đã seed chi nhánh ${branch.code}: ${branch.name}`);
    }
};

const seedUsers = async () => {
    const branches = await prisma.branch.findMany();
    const branchByCode = new Map(branches.map((branch) => [branch.code, branch.id]));

    for (const user of USERS) {
        const hashedPassword = await hashPassword(user.password);
        const branchId = user.branchCode ? branchByCode.get(user.branchCode) : null;

        if (user.branchCode && !branchId) {
            throw new Error(`Không tìm thấy chi nhánh ${user.branchCode} cho tài khoản ${user.email}`);
        }

        await prisma.user.upsert({
            where: { email: user.email },
            update: {
                fullName: user.fullName,
                phone: user.phone,
                password: hashedPassword,
                role: user.role,
                staffCode: user.staffCode || null,
                branchId,
                isActive: true,
            },
            create: {
                email: user.email,
                fullName: user.fullName,
                phone: user.phone,
                password: hashedPassword,
                role: user.role,
                staffCode: user.staffCode || null,
                branchId,
                isActive: true,
            },
        });

        console.log(`Đã seed tài khoản ${user.role}: ${user.email}`);
    }
};

const seedCategories = async () => {
    for (const category of CATEGORIES) {
        await prisma.category.upsert({
            where: { slug: category.slug },
            update: category,
            create: category,
        });

        console.log(`Đã seed danh mục: ${category.slug}`);
    }
};

const seedBrands = async () => {
    for (const brand of BRANDS) {
        await prisma.brand.upsert({
            where: { slug: brand.slug },
            update: brand,
            create: brand,
        });

        console.log(`Đã seed thương hiệu: ${brand.slug}`);
    }
};

const seedProducts = async () => {
    const [categories, brands] = await Promise.all([
        prisma.category.findMany(),
        prisma.brand.findMany(),
    ]);

    const categoryBySlug = new Map(categories.map((category) => [category.slug, category.id]));
    const brandBySlug = new Map(brands.map((brand) => [brand.slug, brand.id]));

    for (const product of PRODUCTS) {
        const categoryId = categoryBySlug.get(product.categorySlug);
        const brandId = brandBySlug.get(product.brandSlug);
        const totalStock = getTotalStock(product.inventory);

        if (!categoryId || !brandId) {
            throw new Error(`Không tìm thấy category hoặc brand cho sản phẩm ${product.slug}`);
        }

        await prisma.product.upsert({
            where: { slug: product.slug },
            update: {
                name: product.name,
                sku: product.sku,
                categoryId,
                brandId,
                price: product.price,
                stock: totalStock,
                minStock: product.minStock,
                maxStock: product.maxStock,
                image: product.image,
                shortDescription: product.shortDescription,
                description: product.description,
                status: product.status,
                isBestSeller: product.isBestSeller,
                isNewArrival: product.isNewArrival,
                rating: product.rating,
                reviewCount: product.reviewCount,
            },
            create: {
                name: product.name,
                slug: product.slug,
                sku: product.sku,
                categoryId,
                brandId,
                price: product.price,
                stock: totalStock,
                minStock: product.minStock,
                maxStock: product.maxStock,
                image: product.image,
                shortDescription: product.shortDescription,
                description: product.description,
                status: product.status,
                isBestSeller: product.isBestSeller,
                isNewArrival: product.isNewArrival,
                rating: product.rating,
                reviewCount: product.reviewCount,
            },
        });

        console.log(`Đã seed sản phẩm: ${product.slug} (${totalStock} tồn tổng)`);
    }
};

const seedBranchInventory = async () => {
    const [branches, products] = await Promise.all([
        prisma.branch.findMany(),
        prisma.product.findMany(),
    ]);

    const branchByCode = new Map(branches.map((branch) => [branch.code, branch]));
    const productBySlug = new Map(products.map((product) => [product.slug, product]));

    for (const seedProduct of PRODUCTS) {
        const product = productBySlug.get(seedProduct.slug);
        if (!product) throw new Error(`Không tìm thấy sản phẩm ${seedProduct.slug} để seed tồn kho`);

        for (const branch of branches) {
            const stock = Number(seedProduct.inventory?.[branch.code] || 0);

            await prisma.branchInventory.upsert({
                where: {
                    branchId_productId: {
                        branchId: branch.id,
                        productId: product.id,
                    },
                },
                update: {
                    stock,
                    minStock: seedProduct.minStock,
                    maxStock: seedProduct.maxStock,
                    lastRestockedAt: new Date(),
                },
                create: {
                    branchId: branch.id,
                    productId: product.id,
                    stock,
                    minStock: seedProduct.minStock,
                    maxStock: seedProduct.maxStock,
                },
            });
        }

        await prisma.product.update({
            where: { id: product.id },
            data: { stock: getTotalStock(seedProduct.inventory), lastRestockedAt: new Date() },
        });
    }

    for (const branch of BRANCHES) {
        if (!branchByCode.has(branch.code)) {
            throw new Error(`Seed thiếu chi nhánh ${branch.code}`);
        }
    }

    console.log('Đã seed tồn kho riêng cho từng chi nhánh');
};

const seedCustomerCart = async () => {
    const customer = await prisma.user.findUnique({
        where: { email: 'customer@guitarhub.vn' },
    });

    if (!customer) {
        throw new Error('Không tìm thấy tài khoản customer để seed giỏ hàng');
    }

    const cart = await prisma.cart.upsert({
        where: { userId: customer.id },
        update: {},
        create: { userId: customer.id },
    });

    const cartProductSlugs = ['yamaha-f310', 'dunlop-tortex-pick-pack'];
    const products = await prisma.product.findMany({
        where: {
            slug: { in: cartProductSlugs },
        },
    });

    await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
    });

    for (const product of products) {
        const quantity = product.slug === 'yamaha-f310' ? 1 : 2;

        await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId: product.id,
                quantity,
                unitPrice: product.price,
            },
        });

        console.log(`Đã seed giỏ hàng: ${product.slug}`);
    }
};

const main = async () => {
    try {
        await seedBranches();
        await seedUsers();
        await seedCategories();
        await seedBrands();
        await seedProducts();
        await seedBranchInventory();
        await seedCustomerCart();
        console.log('Seed dữ liệu mẫu theo mô hình chi nhánh/kho riêng thành công');
    } catch (error) {
        console.error('Seed thất bại:', error);
        process.exitCode = 1;
    } finally {
        await prisma.$disconnect();
    }
};

main();
