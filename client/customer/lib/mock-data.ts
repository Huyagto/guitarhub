import type { 
  Product, 
  CategoryInfo, 
  User, 
  Address, 
  CartItem, 
  Order, 
  Review, 
  Testimonial,
  Brand
} from './types'

// Categories
export const categories: CategoryInfo[] = [
  {
    id: 'acoustic-guitar',
    name: 'Acoustic Guitars',
    description: 'Rich, warm tones for every style',
    image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=600&fit=crop',
    productCount: 24
  },
  {
    id: 'electric-guitar',
    name: 'Electric Guitars',
    description: 'Power and versatility for any genre',
    image: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=800&h=600&fit=crop',
    productCount: 32
  },
  {
    id: 'bass-guitar',
    name: 'Bass Guitars',
    description: 'Deep grooves and solid foundations',
    image: 'https://images.unsplash.com/photo-1629014455855-2a1dbd1aaa88?w=800&h=600&fit=crop',
    productCount: 18
  },
  {
    id: 'classical-guitar',
    name: 'Classical Guitars',
    description: 'Timeless elegance and tradition',
    image: 'https://images.unsplash.com/photo-1558098329-a11cff621064?w=800&h=600&fit=crop',
    productCount: 15
  },
  {
    id: 'accessories',
    name: 'Accessories',
    description: 'Everything you need to play',
    image: 'https://images.unsplash.com/photo-1520166012956-add9ba0835cb?w=800&h=600&fit=crop',
    productCount: 86
  }
]

// Products
export const products: Product[] = [
  {
    id: '1',
    name: 'Taylor 814ce Acoustic Guitar',
    slug: 'taylor-814ce-acoustic-guitar',
    price: 3499,
    oldPrice: 3999,
    category: 'acoustic-guitar',
    brand: 'Taylor',
    rating: 4.9,
    reviewCount: 128,
    images: [
      'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1550985616-10810253b84d?w=800&h=800&fit=crop'
    ],
    description: 'The Taylor 814ce features a grand auditorium body shape with Sitka spruce top and Indian rosewood back and sides. This guitar delivers exceptional tonal balance, clarity, and projection.',
    shortDescription: 'Premium grand auditorium with Sitka spruce top',
    specifications: {
      'Body Shape': 'Grand Auditorium',
      'Top Wood': 'Sitka Spruce',
      'Back/Sides': 'Indian Rosewood',
      'Neck': 'Tropical Mahogany',
      'Fretboard': 'Ebony',
      'Scale Length': '25.5"',
      'Nut Width': '1-3/4"',
      'Electronics': 'Expression System 2'
    },
    stock: 5,
    tags: ['Premium', 'Best Seller'],
    isBestSeller: true,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Gibson Les Paul Standard 50s',
    slug: 'gibson-les-paul-standard-50s',
    price: 2799,
    category: 'electric-guitar',
    brand: 'Gibson',
    rating: 4.8,
    reviewCount: 95,
    images: [
      'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=800&h=800&fit=crop'
    ],
    description: 'The Gibson Les Paul Standard 50s captures the essential Les Paul vibe with a solid mahogany body and maple top, Burstbucker pickups, and classic 50s wiring.',
    shortDescription: 'Classic Les Paul with 50s spec Burstbucker pickups',
    specifications: {
      'Body': 'Solid Mahogany with Maple Top',
      'Neck': 'Mahogany',
      'Fretboard': 'Rosewood',
      'Pickups': 'Burstbucker 1 & 2',
      'Bridge': 'ABR-1 Tune-O-Matic',
      'Scale Length': '24.75"',
      'Frets': '22 Medium Jumbo'
    },
    stock: 8,
    tags: ['Classic', 'Popular'],
    isBestSeller: true,
    createdAt: '2024-02-10'
  },
  {
    id: '3',
    name: 'Fender Player Stratocaster',
    slug: 'fender-player-stratocaster',
    price: 849,
    oldPrice: 999,
    category: 'electric-guitar',
    brand: 'Fender',
    rating: 4.7,
    reviewCount: 312,
    images: [
      'https://images.unsplash.com/photo-1550985616-10810253b84d?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1558098329-a11cff621064?w=800&h=800&fit=crop'
    ],
    description: 'The Fender Player Stratocaster delivers the authentic Fender sound with modern feel. Features alder body, maple neck, and Player Series Alnico 5 pickups.',
    shortDescription: 'Modern Strat with classic Fender tone',
    specifications: {
      'Body': 'Alder',
      'Neck': 'Maple, Modern "C"',
      'Fretboard': 'Maple or Pau Ferro',
      'Pickups': '3x Player Series Alnico 5 Single-Coil',
      'Bridge': '2-Point Synchronized Tremolo',
      'Scale Length': '25.5"',
      'Frets': '22 Medium Jumbo'
    },
    stock: 15,
    tags: ['Value', 'Popular'],
    isBestSeller: true,
    isNewArrival: true,
    createdAt: '2024-03-01'
  },
  {
    id: '4',
    name: 'Martin D-28 Standard',
    slug: 'martin-d-28-standard',
    price: 3299,
    category: 'acoustic-guitar',
    brand: 'Martin',
    rating: 4.9,
    reviewCount: 87,
    images: [
      'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=800&fit=crop'
    ],
    description: 'The Martin D-28 is the quintessential dreadnought acoustic guitar. Featuring Sitka spruce top and East Indian rosewood back and sides.',
    shortDescription: 'Legendary dreadnought acoustic guitar',
    specifications: {
      'Body Shape': 'Dreadnought',
      'Top Wood': 'Sitka Spruce',
      'Back/Sides': 'East Indian Rosewood',
      'Neck': 'Select Hardwood',
      'Fretboard': 'Ebony',
      'Scale Length': '25.4"',
      'Nut Width': '1-3/4"'
    },
    stock: 3,
    tags: ['Legendary', 'Premium'],
    isBestSeller: true,
    createdAt: '2024-01-20'
  },
  {
    id: '5',
    name: 'Fender American Professional II Jazz Bass',
    slug: 'fender-jazz-bass-professional',
    price: 1899,
    category: 'bass-guitar',
    brand: 'Fender',
    rating: 4.8,
    reviewCount: 64,
    images: [
      'https://images.unsplash.com/photo-1629014455855-2a1dbd1aaa88?w=800&h=800&fit=crop'
    ],
    description: 'The American Professional II Jazz Bass delivers the timeless Jazz Bass tone with modern enhancements including V-Mod II pickups and sculpted neck heel.',
    shortDescription: 'Modern Jazz Bass with V-Mod II pickups',
    specifications: {
      'Body': 'Alder',
      'Neck': 'Maple, Slim "C"',
      'Fretboard': 'Rosewood',
      'Pickups': 'V-Mod II Jazz Bass Single-Coil',
      'Bridge': 'HiMass Vintage',
      'Scale Length': '34"',
      'Frets': '20 Narrow Tall'
    },
    stock: 6,
    tags: ['Professional', 'Best Seller'],
    isBestSeller: true,
    createdAt: '2024-02-15'
  },
  {
    id: '6',
    name: 'Cordoba C5 Classical Guitar',
    slug: 'cordoba-c5-classical',
    price: 349,
    oldPrice: 399,
    category: 'classical-guitar',
    brand: 'Cordoba',
    rating: 4.6,
    reviewCount: 156,
    images: [
      'https://images.unsplash.com/photo-1558098329-a11cff621064?w=800&h=800&fit=crop'
    ],
    description: 'The Cordoba C5 is a full-size nylon string guitar with solid Canadian cedar top and mahogany back and sides. Perfect for classical and fingerstyle players.',
    shortDescription: 'Solid top classical guitar for beginners',
    specifications: {
      'Body': 'Full Size',
      'Top Wood': 'Solid Canadian Cedar',
      'Back/Sides': 'Mahogany',
      'Neck': 'Mahogany',
      'Fretboard': 'Rosewood',
      'Scale Length': '650mm',
      'Nut Width': '52mm'
    },
    stock: 12,
    tags: ['Value', 'Beginner Friendly'],
    isNewArrival: true,
    createdAt: '2024-03-05'
  },
  {
    id: '7',
    name: 'PRS Custom 24-08',
    slug: 'prs-custom-24-08',
    price: 4199,
    category: 'electric-guitar',
    brand: 'PRS',
    rating: 4.9,
    reviewCount: 42,
    images: [
      'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=800&h=800&fit=crop'
    ],
    description: 'The PRS Custom 24-08 offers incredible versatility with coil-splitting capability, allowing you to access eight distinct pickup combinations.',
    shortDescription: 'Versatile guitar with 8 pickup combinations',
    specifications: {
      'Body': 'Mahogany with Maple Top',
      'Neck': 'Mahogany, Pattern',
      'Fretboard': 'Rosewood',
      'Pickups': '85/15 Humbuckers',
      'Bridge': 'PRS Patented Tremolo',
      'Scale Length': '25"',
      'Frets': '24'
    },
    stock: 4,
    tags: ['Premium', 'Versatile'],
    isNewArrival: true,
    createdAt: '2024-03-10'
  },
  {
    id: '8',
    name: 'Ernie Ball Music Man StingRay',
    slug: 'ernie-ball-stingray-bass',
    price: 2299,
    category: 'bass-guitar',
    brand: 'Ernie Ball',
    rating: 4.8,
    reviewCount: 78,
    images: [
      'https://images.unsplash.com/photo-1629014455855-2a1dbd1aaa88?w=800&h=800&fit=crop'
    ],
    description: 'The StingRay is known for its powerful, punchy tone thanks to its iconic humbucker pickup and active 3-band EQ.',
    shortDescription: 'Iconic bass with powerful humbucker',
    specifications: {
      'Body': 'Ash',
      'Neck': 'Roasted Maple',
      'Fretboard': 'Ebony',
      'Pickups': 'Music Man Humbucker',
      'Bridge': 'Music Man Classic',
      'Scale Length': '34"',
      'Frets': '22 High Profile'
    },
    stock: 5,
    tags: ['Classic', 'Professional'],
    isNewArrival: true,
    createdAt: '2024-03-08'
  },
  {
    id: '9',
    name: 'Yamaha FG800 Acoustic Guitar',
    slug: 'yamaha-fg800-acoustic',
    price: 229,
    category: 'acoustic-guitar',
    brand: 'Yamaha',
    rating: 4.5,
    reviewCount: 428,
    images: [
      'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=800&fit=crop'
    ],
    description: 'The Yamaha FG800 offers exceptional value with solid Sitka spruce top and nato back and sides. Perfect for beginners and intermediate players.',
    shortDescription: 'Best-selling entry-level acoustic',
    specifications: {
      'Body Shape': 'Traditional Western',
      'Top Wood': 'Solid Sitka Spruce',
      'Back/Sides': 'Nato',
      'Neck': 'Nato',
      'Fretboard': 'Walnut',
      'Scale Length': '25.6"',
      'Nut Width': '43mm'
    },
    stock: 25,
    tags: ['Best Value', 'Beginner'],
    isBestSeller: true,
    createdAt: '2024-01-05'
  },
  {
    id: '10',
    name: 'Dunlop Tortex Picks (12 Pack)',
    slug: 'dunlop-tortex-picks',
    price: 7.99,
    category: 'accessories',
    brand: 'Dunlop',
    rating: 4.8,
    reviewCount: 892,
    images: [
      'https://images.unsplash.com/photo-1520166012956-add9ba0835cb?w=800&h=800&fit=crop'
    ],
    description: 'Dunlop Tortex picks deliver bright, punchy tone with excellent grip and durability. Available in multiple gauges.',
    shortDescription: 'Industry-standard guitar picks',
    specifications: {
      'Material': 'Tortex',
      'Quantity': '12 Picks',
      'Gauge': '.88mm (Green)',
      'Shape': 'Standard 351'
    },
    stock: 100,
    tags: ['Essential', 'Best Seller'],
    isBestSeller: true,
    createdAt: '2024-01-01'
  },
  {
    id: '11',
    name: 'Elixir Nanoweb Acoustic Strings',
    slug: 'elixir-nanoweb-strings',
    price: 15.99,
    oldPrice: 18.99,
    category: 'accessories',
    brand: 'Elixir',
    rating: 4.9,
    reviewCount: 567,
    images: [
      'https://images.unsplash.com/photo-1520166012956-add9ba0835cb?w=800&h=800&fit=crop'
    ],
    description: 'Elixir Nanoweb coated strings last 3-5 times longer than uncoated strings while maintaining a bright, vibrant tone.',
    shortDescription: 'Long-lasting coated acoustic strings',
    specifications: {
      'Coating': 'Nanoweb',
      'Gauge': 'Light (12-53)',
      'Material': '80/20 Bronze',
      'Quantity': '1 Set'
    },
    stock: 75,
    tags: ['Popular', 'Long-lasting'],
    isBestSeller: true,
    isNewArrival: true,
    createdAt: '2024-03-01'
  },
  {
    id: '12',
    name: 'Boss Katana 50 MkII Amp',
    slug: 'boss-katana-50-mkii',
    price: 259,
    oldPrice: 299,
    category: 'accessories',
    brand: 'Boss',
    rating: 4.7,
    reviewCount: 234,
    images: [
      'https://images.unsplash.com/photo-1520166012956-add9ba0835cb?w=800&h=800&fit=crop'
    ],
    description: 'The Boss Katana 50 MkII delivers exceptional tube-amp tone and feel with 50 watts of power and premium Boss effects.',
    shortDescription: '50W amp with premium Boss effects',
    specifications: {
      'Power': '50W',
      'Speaker': '12" Custom',
      'Channels': '5 Amp Characters',
      'Effects': '60+ Boss Effects',
      'Connectivity': 'USB, Aux In, Phones'
    },
    stock: 10,
    tags: ['Best Value', 'Popular'],
    isNewArrival: true,
    createdAt: '2024-02-28'
  }
]

// Brands
export const brands: Brand[] = [
  { id: '1', name: 'Taylor', logo: '/brands/taylor.svg' },
  { id: '2', name: 'Gibson', logo: '/brands/gibson.svg' },
  { id: '3', name: 'Fender', logo: '/brands/fender.svg' },
  { id: '4', name: 'Martin', logo: '/brands/martin.svg' },
  { id: '5', name: 'PRS', logo: '/brands/prs.svg' },
  { id: '6', name: 'Yamaha', logo: '/brands/yamaha.svg' }
]

// Mock User
export const mockUser: User = {
  id: '1',
  fullName: 'John Anderson',
  email: 'john.anderson@email.com',
  phone: '+1 (555) 123-4567',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
  createdAt: '2023-06-15'
}

// Mock Addresses
export const mockAddresses: Address[] = [
  {
    id: '1',
    userId: '1',
    recipientName: 'John Anderson',
    phone: '+1 (555) 123-4567',
    province: 'California',
    district: 'Los Angeles',
    ward: 'Downtown',
    detailAddress: '123 Music Street, Suite 456',
    isDefault: true
  },
  {
    id: '2',
    userId: '1',
    recipientName: 'John Anderson',
    phone: '+1 (555) 123-4567',
    province: 'California',
    district: 'San Francisco',
    ward: 'Mission District',
    detailAddress: '789 Guitar Avenue, Apt 12',
    isDefault: false
  }
]

// Mock Cart Items
export const mockCartItems: CartItem[] = [
  {
    id: '1',
    product: products[2], // Fender Player Stratocaster
    quantity: 1
  },
  {
    id: '2',
    product: products[10], // Elixir Strings
    quantity: 3
  },
  {
    id: '3',
    product: products[9], // Dunlop Picks
    quantity: 2
  }
]

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: '1',
    code: 'GS-2024031501',
    userId: '1',
    items: [
      { id: '1', product: products[0], quantity: 1, price: 3499 }
    ],
    shippingAddress: mockAddresses[0],
    paymentMethod: 'vnpay',
    status: 'delivered',
    subtotal: 3499,
    shippingFee: 0,
    discount: 0,
    total: 3499,
    createdAt: '2024-03-15'
  },
  {
    id: '2',
    code: 'GS-2024032201',
    userId: '1',
    items: [
      { id: '1', product: products[2], quantity: 1, price: 849 },
      { id: '2', product: products[10], quantity: 2, price: 15.99 }
    ],
    shippingAddress: mockAddresses[0],
    paymentMethod: 'cod',
    status: 'shipping',
    subtotal: 880.98,
    shippingFee: 15,
    discount: 0,
    total: 895.98,
    createdAt: '2024-03-22'
  },
  {
    id: '3',
    code: 'GS-2024040101',
    userId: '1',
    items: [
      { id: '1', product: products[6], quantity: 1, price: 4199 }
    ],
    shippingAddress: mockAddresses[1],
    paymentMethod: 'momo',
    status: 'confirmed',
    subtotal: 4199,
    shippingFee: 0,
    discount: 200,
    total: 3999,
    createdAt: '2024-04-01'
  },
  {
    id: '4',
    code: 'GS-2024040501',
    userId: '1',
    items: [
      { id: '1', product: products[9], quantity: 5, price: 7.99 }
    ],
    shippingAddress: mockAddresses[0],
    paymentMethod: 'zalopay',
    status: 'pending',
    subtotal: 39.95,
    shippingFee: 5,
    discount: 0,
    total: 44.95,
    createdAt: '2024-04-05'
  }
]

// Mock Reviews
export const mockReviews: Review[] = [
  {
    id: '1',
    userId: '2',
    userName: 'Michael Chen',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    productId: '1',
    rating: 5,
    comment: 'Absolutely stunning guitar! The tone is incredible and the playability is top-notch. Worth every penny.',
    createdAt: '2024-03-10'
  },
  {
    id: '2',
    userId: '3',
    userName: 'Sarah Williams',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    productId: '1',
    rating: 5,
    comment: 'My dream guitar finally came true. The craftsmanship is exceptional.',
    createdAt: '2024-03-08'
  },
  {
    id: '3',
    userId: '4',
    userName: 'David Miller',
    productId: '1',
    rating: 4,
    comment: 'Great guitar, just wish it came with a case included at this price point.',
    createdAt: '2024-02-28'
  }
]

// Testimonials
export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'James Morrison',
    role: 'Professional Guitarist',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    rating: 5,
    comment: 'GuitarStore has been my go-to for years. Their selection is unmatched and the customer service is exceptional.'
  },
  {
    id: '2',
    name: 'Emily Rodriguez',
    role: 'Music Teacher',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    rating: 5,
    comment: 'I recommend GuitarStore to all my students. Great prices on quality instruments and fast shipping.'
  },
  {
    id: '3',
    name: 'Alex Thompson',
    role: 'Studio Musician',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    rating: 5,
    comment: 'The authenticity guarantee gives me peace of mind. Every guitar I have purchased has exceeded my expectations.'
  }
]

// Helper functions
export function getProductsByCategory(category: string): Product[] {
  return products.filter(p => p.category === category)
}

export function getBestSellers(): Product[] {
  return products.filter(p => p.isBestSeller)
}

export function getNewArrivals(): Product[] {
  return products.filter(p => p.isNewArrival)
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find(p => p.slug === slug)
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, limit)
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price)
}

export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipping: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-muted text-muted-foreground'
}
