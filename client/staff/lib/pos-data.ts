export interface Product {
  id: string
  name: string
  price: number
  category: string
  image: string
  stock: number
  sku: string
}

export interface OrderItem {
  product: Product
  quantity: number
}

export interface CustomerInfo {
  name: string
  phone: string
  note: string
  isWalkIn: boolean
}

export type PaymentMethod = 'cash' | 'bank-transfer' | 'vnpay' | 'momo' | 'zalopay'

export const categories = [
  { id: 'all', name: 'All Products' },
  { id: 'acoustic', name: 'Acoustic Guitar' },
  { id: 'electric', name: 'Electric Guitar' },
  { id: 'bass', name: 'Bass Guitar' },
  { id: 'classical', name: 'Classical Guitar' },
  { id: 'accessories', name: 'Accessories' },
]

export const products: Product[] = [
  {
    id: '1',
    name: 'Taylor 214ce',
    price: 24500000,
    category: 'acoustic',
    image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=300&h=300&fit=crop',
    stock: 5,
    sku: 'TAY-214CE',
  },
  {
    id: '2',
    name: 'Martin D-28',
    price: 68000000,
    category: 'acoustic',
    image: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=300&h=300&fit=crop',
    stock: 3,
    sku: 'MAR-D28',
  },
  {
    id: '3',
    name: 'Fender Stratocaster',
    price: 32000000,
    category: 'electric',
    image: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=300&h=300&fit=crop',
    stock: 8,
    sku: 'FEN-STRAT',
  },
  {
    id: '4',
    name: 'Gibson Les Paul Standard',
    price: 58000000,
    category: 'electric',
    image: 'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=300&h=300&fit=crop',
    stock: 2,
    sku: 'GIB-LP-STD',
  },
  {
    id: '5',
    name: 'Fender Jazz Bass',
    price: 35000000,
    category: 'bass',
    image: 'https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?w=300&h=300&fit=crop',
    stock: 4,
    sku: 'FEN-JAZZ-B',
  },
  {
    id: '6',
    name: 'Music Man StingRay',
    price: 42000000,
    category: 'bass',
    image: 'https://images.unsplash.com/photo-1629515809820-f56d813ab4cc?w=300&h=300&fit=crop',
    stock: 3,
    sku: 'MM-STING',
  },
  {
    id: '7',
    name: 'Cordoba C5',
    price: 8500000,
    category: 'classical',
    image: 'https://images.unsplash.com/photo-1558098329-a11cff621064?w=300&h=300&fit=crop',
    stock: 12,
    sku: 'COR-C5',
  },
  {
    id: '8',
    name: 'Yamaha CG182S',
    price: 12000000,
    category: 'classical',
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop',
    stock: 7,
    sku: 'YAM-CG182S',
  },
  {
    id: '9',
    name: 'Guitar Strings Set',
    price: 250000,
    category: 'accessories',
    image: 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=300&h=300&fit=crop',
    stock: 50,
    sku: 'ACC-STR-01',
  },
  {
    id: '10',
    name: 'Guitar Capo',
    price: 150000,
    category: 'accessories',
    image: 'https://images.unsplash.com/photo-1598449356475-b9f71db7d847?w=300&h=300&fit=crop',
    stock: 30,
    sku: 'ACC-CAPO',
  },
  {
    id: '11',
    name: 'Guitar Tuner',
    price: 350000,
    category: 'accessories',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    stock: 25,
    sku: 'ACC-TUNER',
  },
  {
    id: '12',
    name: 'Guitar Picks (12-pack)',
    price: 80000,
    category: 'accessories',
    image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=300&h=300&fit=crop',
    stock: 100,
    sku: 'ACC-PICKS',
  },
  {
    id: '13',
    name: 'Ibanez RG550',
    price: 28000000,
    category: 'electric',
    image: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=300&h=300&fit=crop',
    stock: 6,
    sku: 'IBA-RG550',
  },
  {
    id: '14',
    name: 'Epiphone Les Paul',
    price: 12500000,
    category: 'electric',
    image: 'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=300&h=300&fit=crop',
    stock: 10,
    sku: 'EPI-LP',
  },
  {
    id: '15',
    name: 'Yamaha FG800',
    price: 5500000,
    category: 'acoustic',
    image: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=300&h=300&fit=crop',
    stock: 15,
    sku: 'YAM-FG800',
  },
  {
    id: '16',
    name: 'Guitar Stand',
    price: 200000,
    category: 'accessories',
    image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=300&h=300&fit=crop',
    stock: 40,
    sku: 'ACC-STAND',
  },
]

export const paymentMethods: { id: PaymentMethod; name: string; icon: string }[] = [
  { id: 'cash', name: 'Cash', icon: 'banknote' },
  { id: 'bank-transfer', name: 'Bank Transfer', icon: 'building' },
  { id: 'vnpay', name: 'VNPay', icon: 'credit-card' },
  { id: 'momo', name: 'MoMo', icon: 'smartphone' },
  { id: 'zalopay', name: 'ZaloPay', icon: 'wallet' },
]

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}
