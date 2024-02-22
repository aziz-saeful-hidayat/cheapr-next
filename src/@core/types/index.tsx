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

export type Rating = {
  pk: number
  name: string
  color: string
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
  prefix: string
  suffix: string
  suffix2: string
}
export type Room = {
  pk: number
  name: string
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
  platform: string
  link: string
  num_sales: number
  num_items: number
  total_sum: string
  shipping_sum: string
  channel: Channel
}
export type BuyingOrder = {
  pk: number
  order_id: string
  order_date: string
  delivery_date: string
  status: string
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
  destination: string
  sales: {
    pk: number
    order_id: string
    delivery_date: string
  }
  selling_buying: SellingBuying[]
}

export type Manager = {
  pk: number
  name: string
}

export type ProductMakes = {
  pk: number
  name: string
}

export type ProductTypes = {
  pk: number
  name: string
}

export type ProductCondition = {
  pk: number
  name: string
}

export type CustomerService = {
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

export type Tracking = {
  pk: number
  tracking_number: string
  carrier: null | string
  fullcarrier: Carrier
  last_updated: null | string
  activity_date: null | string
  status: null | string
  milestone_name: null | string
  location: null | string
  est_delivery: null | string
  eta_date: null | string
  delivery_date: null
  address: null | string
  src_address: null | string
  person: Person
  signed: string
  proof: string
}
export type ERPData = {
  selling: number
  data: string
}

export type OpenIssue = {
  pk: number
  status: string
  appeal: string
  az: boolean
  fb: boolean
  cb: boolean
  cs_comment: string
  date: string
  apl_by: string
  appealed: boolean
  fall_off: string
  case_id: string
  steps_done: string
  next_step: string
  legal_comment: string
  cs: CustomerService
  total_correspondence: number
  sales: {
    pk: number
    channel_order_id: string
    seller_name: string
    order_date: string
    ship_date: string
    delivery_date: string
    salesitems: {
      pk: number
      tracking: Tracking
      letter_tracking: Tracking
      sku: CAProduct
    }[]
    person: Person
  }
}
export type GradeLeads = {
  pk: number
  number: number
  text: string
  color: string
}

export type LeadsSalesItems = {
  pk: number
  item: InventoryItem
  title: string
  selling: SellingOrder
  sku: CAProduct
  sub_sku: CAProduct
  tracking: Tracking
  status: string
  comment: string
  refunded: string
  salesitem_replaced: ReplacementSalesItems
  salesitem_return: FullReturnSalesItems
  rma_date: string
  total_correspondence: number
  grade: GradeLeads
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
  erp_data: ERPData
  total_correspondence: number
}
export type Item = {
  pk: number
  item_id: string
  title: string
  aging: number
  buying: {
    pk: number
    order_id: string
    order_date: string
    delivery_date: null | string
    channel: number
    tracking_number: null | string
    tracking: null | Tracking
    seller_name: null | string
    seller: {
      pk: number
      name: string
      platform: null | string
      link: null | string
    }
    channel_order_id: string
    purchase_link: string
    total_cost: null | string
    shipping_cost: null | string
    comment: null | string
    return_up_to_date: null | string
    destination: null | string
    sales: {
      pk: number
      order_id: null | string
    }
    verified: boolean
    person: {
      pk: number
      name: string
      phone: string
      email: null | string
      address: {
        pk: number
        street_1: string
        street_2: null
        zip: null | string
        city: {
          pk: number
          name: string
          state: {
            pk: number
            name: string
            short: string
            country: {
              pk: number
              name: string
              short: string
            }
          }
        }
      }
    }
  }
  selling: null | string
  product: {
    pk: number
    sku: string
    mpn: string
    make: null | string
    model: string
    asin: string
    in_database: boolean
  }
  rating: null | string
  status: null | string
  serial: null | string
  comment: null | string
  room: Room
  total_cost: string
  shipping_cost: null | string
  all_cost: number
  dropship: boolean
  tracking: {
    pk: number
    tracking_number: string
    carrier: null | string
    fullcarrier: {
      pk: number
      name: string
      image: string
      prefix: string
      suffix: string
      suffix2: string
    }
    last_updated: null | string
    activity_date: null | string
    status: null | string
    milestone_name: null | string
    location: null | string
    est_delivery: null | string
    eta_date: null | string
    delivery_date: null
    address: null | string
    src_address: null | string
    person: {
      pk: number
      name: string
      phone: string
      email: null | string
      address: {
        pk: number
        street_1: string
        street_2: null | string
        zip: string
        city: {
          pk: number
          name: string
          state: {
            pk: number
            name: string
            short: string
            country: {
              pk: number
              name: string
              short: string
            }
          }
        }
      }
    }
  }
  itemsales: {
    pk: number
    sku: {
      pk: number
      sku: string
      mpn: string
      make: string
      model: string
      asin: string
      in_database: false
    }
    sub_sku: null | string
    tracking: null | string
    selling: {
      pk: number
      order_id: string
      channel_order_id: string
      seller_name: string
      gross_sales: null | number
      ss_shipping_cost: null | number
      profit: number
    }
    manager: {
      pk: number
      name: string
      user: null | number
    }
  }
}

export type SellingBuying = {
  pk: number
  sales: {
    pk: number
    order_id: string
  }
  purchase: {
    pk: number
    order_id: string
    channel_order_id: string
  }
}
export type SalesItem = {
  pk: number
  selling: {
    pk: number
    order_id: string
    display_ref: string
    order_date: string
    delivery_date: string
    ship_date: string
    channel: {
      pk: number
      name: string
      image: string
    }
    seller_name: string
    purchase_items: number
    inbound_shipping: number
    purchase_cost: number
    gross_sales: number
    profit: number
    all_cost: number
    channel_order_id: string
    sell_link: string
    total_cost: string
    shipping_cost: string
    ss_shipping_cost: string
    channel_fee: string
    submited: boolean
  }
  sku: {
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
  room: Room
  rating: Rating
  total_cost: string
  shipping_cost: string
}

export type ReturnSalesItems = {
  date: string
  tracking: number
  status: string
  comment: string
  label: string
  item: number
}

export type FullReturnSalesItems = {
  date: string
  tracking: Tracking
  status: string
  comment: string
  label: string
  item: SalesItem
}

export type ReplacementSalesItems = {
  date: string
  tracking: Tracking
  status: string
  comment: string
  label: string
  item: SalesItem
  replacement: SalesItem
}

export type ReturnSales = {
  pk: number
  sales: SellingOrder
  status: string
  comment: string
  label: string
  tracking: Tracking
  date: string
  total_correspondence: number
}

export type PM = {
  pk: number
  name: string
}

export type Make = {
  pk: number
  name: string
}

export type PMKwsExtra = {
  pk: number
  pm: PM
  types: number
}

export type MakeDetail = {
  pk: number
  name: string
  kws_make: PMKwsExtra[]
}

export type PMKws = {
  pk: number
  pm: PM
  make: Make
  makers: string
  keyword: string
  condition: string
  buying_format: string
  item_location: string
  exclude: string
  target_url: string
  total_listing: number
  vetted: number
  need_response: number
  kws_pm: PMKws[]
}

export type ExtraPM = {
  pk: number
  name: PM
  keyword: string
  target_url: string
  total_listing: number
  vetted: number
  need_response: number
  kws_pm: ExtraPM[]
}

export type AgingSummary = {
  pk: number
  sku: string
  mpn: string
  make: string
  model: string
  asin: string
  under_30_days: number
  between_30_60_days: number
  between_60_90_days: number
  between_90_180_days: number
  between_180_365_days: number
  more_365_days: number
  qty: number
  sum: string
  avg: string
}

export type InventoryAging = {
  channel_order_id: string
  inventoryitems__product__make: string
  inventoryitems__product__model: string
  inventoryitems__product__mpn: string
  purchase_link: string
  seller__name: string
  status: string
  pk__count: number
  rate: string
  label: string
  amount: string
  order_date: string
  delivery_date: string
}

export type SalesCorrespondence = {
  pk: number
  sales: string
  selling: number
  time_stamp: string
  content: string
  left: boolean
  sender_name: string
  freshdesk_id: string
}
