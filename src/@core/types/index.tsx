export type Country = {
  pk: number
  name: string
  short: string
}
export type State = {
  pk: number
  name: string
  short: string
  country: Country
}
export type City = {
  pk: number
  name: string
  state: State
}
export type Address = {
  pk: number
  street_1: string
  street_2: string
  zip: string
  city: City
}
export type Person = {
  pk: number
  name: string
  phone: string
  email: string
  history: number
  address: Address
}
export type Channel = {
  pk: number
  name: string
  image: string
}
export type Carrier = {
  pk: number
  name: string
  image: string
}
export type Room = {
  pk: number
  name: string
  room_id: string
}
export type InventoryPayload = {
  buying: number
  selling: number
  product: number
  status: string
  serial: string
  comment: string
  room: number
  total_cost: number
  shipping_cost: number
}

export type InventoryItem = {
  [key: string]: any
}
export type CAProduct = {
  pk: number
  sku: string
  mpn: string
  make: string
  model: string
  asin: string
}
export type Seller = {
  pk: number
  name: string
}
export type BuyingOrder = {
  pk: number
  order_id: string
  order_date: string
  delivery_date: string
  channel: {
    pk: number
    name: string
    image: string
  }
  carrier: {
    pk: number
    name: string
    image: string
  }
  seller: {
    pk: number
    name: string
  }
  tracking_number: string
  seller_name: string
  purchase_link: string
  channel_order_id: string
  total_cost: number
  shipping_cost: number
  comment: string
  inventoryitems: InventoryItem[]
  num_items: number
  total_sum: number
  shipping_sum: number
  person: Person
  destination: 'D' | 'H' | null
}

export type Manager = {
  pk: number
  name: string
}
export type ItemOption = {
  pk: number
  name: string
  serial: string
  product: {
    sku: string
    make: string
    model: string
    mpn: string
  }
}
export type ItemOption2 = {
  pk: number
  buying: number
  selling: number
  product: {
    pk: number
    sku: string
    mpn: string
    make: string
    model: string
    asin: string
  }
  status: string
  serial: string
  comment: string
  room: {
    pk: number
    name: string
    room_id: string
  }
  total_cost: string
  shipping_cost: string
}
export type SellingOrder = {
  pk: number
  order_id: string
  order_date: string
  delivery_date: string
  ship_date: string
  channel: {
    pk: number
    name: string
  }
  subs_status: boolean
  channel_order_id: string
  tracking_number: string
  seller_name: string
  sell_link: string
  total_cost: number
  shipping_cost: number
  ss_shipping_cost: number
  purchase_cost: number
  gross_sales: number
  channel_fee: number
  profit: number
  fulfillment: string
  comment: string
  status: string
  delivery_status: string
  sellingitems: InventoryItem[]
  salesitems: InventoryItem[]
  person: Person
  submited: boolean
}
