'use strict';

const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { PrismaClient } = require('../generated/prisma/index.js');
const { hashPassword } = require('../core/utils');
const { roles } = require('../modules/auth/constants');

const prisma = new PrismaClient();

const SEED_USERS = [
    {
        email: 'customer@guitarhub.com',
        password: 'Customer@123',
        fullName: 'Khach Hang Mau',
        role: roles.CUSTOMER,
    },
    {
        email: 'staff@guitarhub.com',
        password: 'Staff@123',
        fullName: 'Nhan Vien Mau',
        role: roles.STAFF,
    },
    {
        email: 'manager@guitarhub.com',
        password: 'Manager@123',
        fullName: 'Quan Ly Mau',
        role: roles.MANAGER,
    },
];

const SEED_CATEGORIES = [
    {
        name: 'Guitar Acoustic',
        slug: 'acoustic-guitar',
        description: 'Danh muc guitar acoustic danh cho bieu dien va luyen tap.',
        image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=600&fit=crop',
        status: 'ACTIVE',
    },
    {
        name: 'Guitar Electric',
        slug: 'electric-guitar',
        description: 'Danh muc guitar electric cho nhieu phong cach am nhac.',
        image: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=800&h=600&fit=crop',
        status: 'ACTIVE',
    },
    {
        name: 'Bass Guitar',
        slug: 'bass-guitar',
        description: 'Danh muc bass guitar cho tap luyen, thu am va bieu dien.',
        image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=600&fit=crop',
        status: 'ACTIVE',
    },
    {
        name: 'Phu Kien',
        slug: 'accessories',
        description: 'Phu kien guitar va thiet bi ho tro di kem.',
        image: 'https://images.unsplash.com/photo-1520166012956-add9ba0835cb1?w=800&h=600&fit=crop',
        status: 'ACTIVE',
    },
];

const SEED_BRANDS = [
    {
        name: 'Taylor',
        slug: 'taylor',
        description: 'Thuong hieu guitar acoustic cao cap.',
        logo: '/placeholder.svg?height=40&width=40',
        status: 'ACTIVE',
    },
    {
        name: 'Fender',
        slug: 'fender',
        description: 'Thuong hieu noi tieng voi electric guitar va bass.',
        logo: '/placeholder.svg?height=40&width=40',
        status: 'ACTIVE',
    },
    {
        name: 'Yamaha',
        slug: 'yamaha',
        description: 'Thuong hieu pho bien cho guitar va nhac cu hoc tap.',
        logo: '/placeholder.svg?height=40&width=40',
        status: 'ACTIVE',
    },
    {
        name: 'Ibanez',
        slug: 'ibanez',
        description: 'Thuong hieu danh cho rock, metal va guitar hieu nang cao.',
        logo: '/placeholder.svg?height=40&width=40',
        status: 'ACTIVE',
    },
    {
        name: 'Dunlop',
        slug: 'dunlop',
        description: 'Phu kien va thiet bi ho tro cho guitar.',
        logo: '/placeholder.svg?height=40&width=40',
        status: 'ACTIVE',
    },
];

const SEED_PRODUCTS = [
    {
        name: 'Taylor 214ce',
        slug: 'taylor-214ce',
        sku: 'TAY-214CE',
        categorySlug: 'acoustic-guitar',
        brandSlug: 'taylor',
        price: 24500000,
        stock: 5,
        image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=800&fit=crop',
        shortDescription: 'Mau acoustic can bang tot cho bieu dien.',
        description: 'Taylor 214ce phu hop cho nguoi choi can am thanh sang, de choi va hoan thien dep.',
        status: 'ACTIVE',
        isBestSeller: true,
        isNewArrival: false,
        rating: 4.8,
        reviewCount: 124,
    },
    {
        name: 'Taylor GS Mini',
        slug: 'taylor-gs-mini',
        sku: 'TAY-GS-MINI',
        categorySlug: 'acoustic-guitar',
        brandSlug: 'taylor',
        price: 17900000,
        stock: 7,
        image: 'https://images.unsplash.com/photo-1514119412350-e174d90d280e?w=800&h=800&fit=crop',
        shortDescription: 'Mau guitar nho gon de mang di va luyen tap.',
        description: 'Taylor GS Mini cho am thanh day dan, dang nho gon va rat phu hop cho nguoi di dien hoac du lich.',
        status: 'ACTIVE',
        isBestSeller: true,
        isNewArrival: true,
        rating: 4.7,
        reviewCount: 91,
    },
    {
        name: 'Fender Player Stratocaster',
        slug: 'fender-player-stratocaster',
        sku: 'FEN-PLAYER-STRAT',
        categorySlug: 'electric-guitar',
        brandSlug: 'fender',
        price: 21990000,
        stock: 8,
        image: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=800&h=800&fit=crop',
        shortDescription: 'Mau Stratocaster pho bien cho nhieu dong nhac.',
        description: 'Fender Player Stratocaster cho cam giac choi tot, am thanh linh hoat va phu hop san khau.',
        status: 'ACTIVE',
        isBestSeller: true,
        isNewArrival: true,
        rating: 4.9,
        reviewCount: 156,
    },
    {
        name: 'Ibanez RG550',
        slug: 'ibanez-rg550',
        sku: 'IBA-RG550',
        categorySlug: 'electric-guitar',
        brandSlug: 'ibanez',
        price: 28900000,
        stock: 4,
        image: 'https://images.unsplash.com/photo-1543062094-d22540a39c1c?w=800&h=800&fit=crop',
        shortDescription: 'Mau electric guitar hieu nang cao cho rock va metal.',
        description: 'Ibanez RG550 noi bat voi can mong, toc do nhanh va pickup manh me danh cho san khau.',
        status: 'ACTIVE',
        isBestSeller: false,
        isNewArrival: true,
        rating: 4.8,
        reviewCount: 63,
    },
    {
        name: 'Yamaha TRBX174',
        slug: 'yamaha-trbx174',
        sku: 'YAM-TRBX174',
        categorySlug: 'bass-guitar',
        brandSlug: 'yamaha',
        price: 7990000,
        stock: 10,
        image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=800&fit=crop',
        shortDescription: 'Mau bass guitar de tiep can cho nguoi moi bat dau.',
        description: 'Yamaha TRBX174 cung cap am bass chac, de danh va do ben cao cho nhu cau hoc tap va bieu dien.',
        status: 'ACTIVE',
        isBestSeller: false,
        isNewArrival: false,
        rating: 4.6,
        reviewCount: 44,
    },
    {
        name: 'Yamaha F310',
        slug: 'yamaha-f310',
        sku: 'YAM-F310',
        categorySlug: 'acoustic-guitar',
        brandSlug: 'yamaha',
        price: 3490000,
        stock: 15,
        image: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=800&h=800&fit=crop',
        shortDescription: 'Mau acoustic pho thong phu hop cho hoc vien va nguoi moi.',
        description: 'Yamaha F310 la lua chon can bang giua gia thanh, do ben va chat am de nghe.',
        status: 'ACTIVE',
        isBestSeller: true,
        isNewArrival: false,
        rating: 4.5,
        reviewCount: 188,
    },
    {
        name: 'Dunlop Tortex Pick Pack',
        slug: 'dunlop-tortex-pick-pack',
        sku: 'DUN-TORTEX-PICK',
        categorySlug: 'accessories',
        brandSlug: 'dunlop',
        price: 99000,
        stock: 50,
        image: 'https://images.unsplash.com/photo-1520166012956-add9ba0835cb?w=800&h=800&fit=crop',
        shortDescription: 'Bo pick pho bien cho nguoi choi guitar.',
        description: 'Bo pick Dunlop Tortex mang lai do bam tot va nhieu lua chon do day.',
        status: 'ACTIVE',
        isBestSeller: false,
        isNewArrival: true,
        rating: 4.7,
        reviewCount: 72,
    },
    {
        name: 'Capo Acoustic Pro',
        slug: 'capo-acoustic-pro',
        sku: 'ACC-CAPO-PRO',
        categorySlug: 'accessories',
        brandSlug: 'dunlop',
        price: 250000,
        stock: 24,
        image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&h=800&fit=crop',
        shortDescription: 'Capo gon nhe, kep chac va de thao tac.',
        description: 'Capo Acoustic Pro phu hop cho bieu dien nhanh, giup chuyen tone on dinh va khong re day.',
        status: 'ACTIVE',
        isBestSeller: false,
        isNewArrival: false,
        rating: 4.4,
        reviewCount: 21,
    },
];

const seedUsers = async () => {
    for (const user of SEED_USERS) {
        const hashedPassword = await hashPassword(user.password);

        await prisma.user.upsert({
            where: { email: user.email },
            update: {
                fullName: user.fullName,
                password: hashedPassword,
                role: user.role,
                isActive: true,
            },
            create: {
                email: user.email,
                fullName: user.fullName,
                password: hashedPassword,
                role: user.role,
                isActive: true,
            },
        });

        console.log(`Da seed tai khoan ${user.role}: ${user.email}`);
    }
};

const seedCategories = async () => {
    for (const category of SEED_CATEGORIES) {
        await prisma.category.upsert({
            where: { slug: category.slug },
            update: category,
            create: category,
        });

        console.log(`Da seed danh muc: ${category.slug}`);
    }
};

const seedBrands = async () => {
    for (const brand of SEED_BRANDS) {
        await prisma.brand.upsert({
            where: { slug: brand.slug },
            update: brand,
            create: brand,
        });

        console.log(`Da seed thuong hieu: ${brand.slug}`);
    }
};

const seedProducts = async () => {
    const categories = await prisma.category.findMany();
    const brands = await prisma.brand.findMany();

    const categoryMap = new Map(categories.map((category) => [category.slug, category.id]));
    const brandMap = new Map(brands.map((brand) => [brand.slug, brand.id]));

    for (const product of SEED_PRODUCTS) {
        const categoryId = categoryMap.get(product.categorySlug);
        const brandId = brandMap.get(product.brandSlug);

        if (!categoryId || !brandId) {
            throw new Error(`Khong tim thay category hoac brand cho san pham ${product.slug}`);
        }

        await prisma.product.upsert({
            where: { slug: product.slug },
            update: {
                name: product.name,
                sku: product.sku,
                categoryId,
                brandId,
                price: product.price,
                stock: product.stock,
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
                stock: product.stock,
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

        console.log(`Da seed san pham: ${product.slug}`);
    }
};

const seedCustomerCart = async () => {
    const customer = await prisma.user.findUnique({
        where: { email: 'customer@guitarhub.com' },
    });

    if (!customer) {
        throw new Error('Khong tim thay tai khoan customer de seed gio hang');
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

        console.log(`Da seed cart item: ${product.slug}`);
    }
};

const main = async () => {
    try {
        await seedUsers();
        await seedCategories();
        await seedBrands();
        await seedProducts();
        await seedCustomerCart();
        console.log('Seed tai khoan, catalog va gio hang mau thanh cong');
    } catch (error) {
        console.error('Seed that bai:', error);
        process.exitCode = 1;
    } finally {
        await prisma.$disconnect();
    }
};

main();
