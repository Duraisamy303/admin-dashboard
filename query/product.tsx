import { gql } from '@apollo/client';

export const PRODUCT_LIST = gql`
    query ProductListPaginated($channel: String!, $first: Int!, $after: String, $direction: OrderDirection!, $field: ProductOrderField!, $filter: ProductFilterInput) {
        products(first: $first, after: $after, channel: $channel, filter: $filter, sortBy: { direction: $direction, field: $field }) {
            totalCount
            edges {
                node {
                    ...ProductListItem
                    tags {
                        name
                        id
                    }
                    __typename
                    getCrosssells {
                        name
                        productId
                        id
                    }
                    getUpsells {
                        name
                        productId
                        id
                    }
                }
                cursor
                __typename
            }
            pageInfo {
                endCursor
                hasNextPage
                hasPreviousPage
                startCursor
                __typename
            }
            __typename
        }
    }

    fragment ProductListItem on Product {
        id
        name
        slug
        metadata {
            key
            value
        }
        pricing {
            priceRange {
                start {
                    gross {
                        amount
                        currency
                        __typename
                    }
                    __typename
                }
                stop {
                    gross {
                        amount
                        currency
                        __typename
                    }
                    __typename
                }
                __typename
            }
            discount {
                currency
                __typename
            }
            __typename
        }
        category {
            id
            name
            __typename
        }
        thumbnail(size: 1024, format: WEBP) {
            url
            alt
            __typename
        }
        variants {
            id
            sku
            quantityAvailable
            __typename
        }
        defaultVariant {
            sku
        }
        images {
            url
            __typename
        }
        description
        updatedAt
        channelListings {
            publishedAt
            isPublished
            __typename
        }
        __typename
    }
`;

export const CUSTOMER_ALL_LIST = gql`
    query ListCustomers($after: String, $before: String, $first: Int, $last: Int, $filter: CustomerFilterInput, $sort: UserSortingInput, $PERMISSION_MANAGE_ORDERS: Boolean!) {
        customers(after: $after, before: $before, first: $first, last: $last, filter: $filter, sortBy: $sort) {
            edges {
                node {
                    ...Customer
                    orders @include(if: $PERMISSION_MANAGE_ORDERS) {
                        totalCount
                        __typename
                    }
                    __typename
                }
                __typename
            }
            pageInfo {
                endCursor
                hasNextPage
                hasPreviousPage
                startCursor
                __typename
            }
            __typename
            totalCount
        }
    }

    fragment Customer on User {
        id
        email
        firstName
        lastName
        dateJoined
        isActive
        updatedAt
        lastLogin
        __typename
    }
`;

export const DELETE_PRODUCT = gql`
    mutation deleteCategory($id: ID!) {
        categoryDelete(id: $id) {
            errors {
                message
                values
            }
        }
    }
`;

export const UPDATED_PRODUCT_PAGINATION = gql`
    query ProductListPaginatedInitialandNext($channel: String!, $first: Int!, $after: String, $search: String!, $filter: ProductFilterInput, $where: ProductWhereInput) {
        products(first: $first, after: $after, channel: $channel, filter: $filter, search: $search, sortBy: { direction: DESC, field: CREATED_AT }, where: $where) {
            totalCount
            edges {
                node {
                    ...ProductListItem
                    tags {
                        name
                        id
                        __typename
                    }
                    __typename
                }
                cursor
                __typename
            }
            pageInfo {
                endCursor
                hasNextPage
                hasPreviousPage
                startCursor
                __typename
            }
            __typename
        }
    }

    fragment ProductListItem on Product {
        id
        name
        slug
        orderNo
        defaultVariant {
            id
            name
            sku
        }
        pricing {
            priceRange {
                start {
                    gross {
                        amount
                        currency
                        __typename
                    }
                    __typename
                }
                stop {
                    gross {
                        amount
                        currency
                        __typename
                    }
                    __typename
                }
                __typename
            }
            discount {
                currency
                __typename
            }
            __typename
        }
        category {
            id
            name
            __typename
        }
        thumbnail(size: 1024) {
            url
            alt
            __typename
        }
        variants {
            id
            sku
            quantityAvailable
            __typename
        }
        media {
            url
            __typename
        }
        description
        updatedAt
        channelListings {
            publishedAt
            isPublished
            __typename
        }
        __typename
    }
`;

export const PRODUCT_PREV_PAGINATION = gql`
    query ProductListPaginated($channel: String!, $last: Int!, $before: String, $search: String!, $filter: ProductFilterInput) {
        products(filter: $filter, last: $last, before: $before, channel: $channel, search: $search, sortBy: { direction: DESC, field: CREATED_AT }) {
            totalCount
            edges {
                node {
                    ...ProductListItem
                    tags {
                        name
                        id
                        __typename
                    }
                    __typename
                }
                cursor
                __typename
            }
            pageInfo {
                endCursor
                hasNextPage
                hasPreviousPage
                startCursor
                __typename
            }
            __typename
        }
    }

    fragment ProductListItem on Product {
        id
        name
        slug
        defaultVariant {
            id
            name
            sku
        }
        pricing {
            priceRange {
                start {
                    gross {
                        amount
                        currency
                        __typename
                    }
                    __typename
                }
                stop {
                    gross {
                        amount
                        currency
                        __typename
                    }
                    __typename
                }
                __typename
            }
            discount {
                currency
                __typename
            }
            __typename
        }
        category {
            id
            name
            __typename
        }
        thumbnail(size: 1024, format: WEBP) {
            url
            alt
            __typename
        }
        variants {
            id
            sku
            quantityAvailable
            __typename
        }
        media {
            url
            __typename
        }
        description
        updatedAt
        channelListings {
            publishedAt
            isPublished
            __typename
        }
        __typename
    }
`;

export const SEND_GIFT_CART = gql`
    mutation SendGiftCard($orderid: ID!) {
        sendGiftCard(id: $orderid) {
            errors {
                message
            }
        }
    }
`;

export const CATEGORY_LIST = gql`
    query CategoryList($first: Int, $last: Int, $before: String, $after: String, $channel: String!, $search: String) {
        categories(first: $first, after: $after, last: $last, before: $before, filter: { search: $search }) {
            edges {
                node {
                    id
                    name
                    description
                    products(channel: $channel) {
                        totalCount
                        __typename
                    }
                    __typename
                    parent {
                        id
                        name
                        __typename
                    }
                    backgroundImage {
                        url
                        alt
                    }
                    backgroundImageUrl
                    menuOrder
                }
                __typename
            }
            __typename
            pageInfo {
                endCursor
                hasNextPage
                hasPreviousPage
                startCursor
            }
            totalCount
        }
    }
`;

export const CATEGORY_DETAILS = gql`
    query ViewCategory($id: ID!) {
        category(id: $id) {
            name
            menuOrder
            backgroundImageUrl
            description
            id
            level
            updatedAt
            slug
        }
    }
`;

export const UPDATE_INVOICE_PDF = gql`
    mutation InvoiceRequest($invoiceId: ID!) {
        invoicePdfRegenerate(id: $invoiceId) {
            errors {
                message
            }
            invoice {
                url
            }
        }
    }
`;

export const SEND_PAYLSIP = gql`
    mutation PaySlipSendNotification($orderid: ID!) {
        payslipSendNotification(id: $orderid) {
            errors {
                message
            }
        }
    }
`;

export const CREATE_CATEGORY = gql`
    mutation CategoryCreate($parent: ID, $input: CategoryInput!) {
        categoryCreate(parent: $parent, input: $input) {
            category {
                ...CategoryDetails
                __typename
            }
            errors {
                ...ProductError
                __typename
            }
            __typename
        }
    }

    fragment CategoryDetails on Category {
        id
        ...Metadata
        backgroundImage {
            alt
            url
            __typename
        }
        name
        slug
        description
        seoDescription
        seoTitle
        parent {
            id
            __typename
        }
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }

    fragment ProductError on ProductError {
        code
        field
        message
        __typename
    }
`;

export const UPDATE_CATEGORY = gql`
    mutation updateCategory($id: ID!, $input: CategoryInput!) {
        categoryUpdate(id: $id, input: $input) {
            category {
                id
                name
                description
                slug
            }
        }
    }
`;

export const UPDATE_CATEGORY_NEW = gql`
    mutation updateCategory($id: ID!, $input: CategoryInput!) {
        categoryUpdate(id: $id, input: $input) {
            category {
                id
                name
                backgroundImageUrl
                description
                slug
                __typename
            }
            __typename
        }
    }
`;

export const CREATE_TAG = gql`
    mutation ProductStyleCreate($input: TagInput!) {
        tagCreate(input: $input) {
            tag {
                id
                name
                slug
            }
        }
    }
`;

export const UPDATE_TAG = gql`
    mutation Tag_Update($id: ID!, $input: TagInput!) {
        tagUpdate(id: $id, input: $input) {
            tag {
                id
                name
                slug
            }
        }
    }
`;

export const DELETE_TAG = gql`
    mutation Tag_Delete($id: ID!) {
        tagDelete(id: $id) {
            errors {
                message
            }
        }
    }
`;

export const DELETE_CATEGORY = gql`
    mutation deleteCategory($id: ID!) {
        categoryDelete(id: $id) {
            errors {
                message
                values
            }
        }
    }
`;

export const FINISH_LIST = gql`
    query GetProductFinished {
        productFinishes(first: 100) {
            edges {
                node {
                    name
                    slug
                    id
                }
            }
            totalCount
        }
    }
`;

export const CREATE_FINISH = gql`
    mutation ProductFinishCreate($input: ProductFinishInput!) {
        productFinishCreate(input: $input) {
            productFinish {
                name
                slug
                id
            }
        }
    }
`;

export const UPDATE_FINISH = gql`
    mutation ProductFinishUpdate($id: ID!, $input: ProductFinishInput!) {
        productFinishUpdate(id: $id, input: $input) {
            productFinish {
                id
                name
                slug
            }
        }
    }
`;

export const DELETE_FINISH = gql`
    mutation ProductFinishDelete($id: ID!) {
        productFinishDelete(id: $id) {
            productFinish {
                id
                name
                slug
            }
        }
    }
`;

export const DESIGN_LIST = gql`
    query MyQuery {
        productDesigns(first: 100) {
            totalCount
            edges {
                node {
                    id
                    name
                    slug
                }
            }
        }
    }
`;

export const CREATE_DESIGN = gql`
    mutation ProductDesignCreate($input: ProductDesignInput!) {
        productDesignCreate(input: $input) {
            productDesign {
                id
                name
                slug
            }
        }
    }
`;

export const UPDATE_DESIGN = gql`
    mutation ProductDesignUpdate($id: ID!, $input: ProductDesignInput!) {
        productDesignUpdate(id: $id, input: $input) {
            productDesign {
                id
                name
                slug
            }
        }
    }
`;

export const DELETE_DESIGN = gql`
    mutation ProductDesignDelete($id: ID!) {
        productDesignDelete(id: $id) {
            ok
            errors {
                values
                message
            }
        }
    }
`;

export const STONE_LIST = gql`
    query MyQuery {
        productStoneTypes(first: 100) {
            edges {
                node {
                    id
                    name
                    slug
                }
            }
        }
    }
`;

export const SIZE_LIST = gql`
    query Size_List {
        sizes(first: 100) {
            edges {
                node {
                    id
                    name
                }
            }
        }
    }
`;

export const CREATE_SIZE = gql`
    mutation Create_Size($input: SizeInput!) {
        sizeCreate(input: $input) {
            size {
                id
                name
                slug
            }
        }
    }
`;

export const UPDATE_SIZE = gql`
    mutation Size_Update($id: ID!, $input: SizeInput!) {
        sizeUpdate(id: $id, input: $input) {
            size {
                id
                name
                slug
            }
        }
    }
`;

export const DELETE_SIZE = gql`
    mutation Size_Delete($id: ID!) {
        sizeDelete(id: $id) {
            errors {
                message
            }
        }
    }
`;

export const TYPE_LIST = gql`
    query Itemtype_List {
        itemTypes(first: 100) {
            edges {
                node {
                    id
                    name
                }
            }
        }
    }
`;

export const CREATE_TYPE = gql`
    mutation Itemtype_Create($input: ItemTypeInput!) {
        itemTypeCreate(input: $input) {
            errors {
                message
            }
            itemType {
                id
                name
            }
        }
    }
`;

export const UPDATE_TYPE = gql`
    mutation ItemtypeUpdate($id: ID!, $input: ItemTypeInput!) {
        itemTypeUpdate(id: $id, input: $input) {
            errors {
                message
            }
            itemType {
                id
                name
            }
        }
    }
`;

export const DELETE_TYPE = gql`
    mutation Item_Type_Delete($id: ID!) {
        itemTypeDelete(id: $id) {
            errors {
                message
            }
        }
    }
`;

export const COLOR_LIST = gql`
    query Stone_Color_List {
        stoneColors(first: 100) {
            edges {
                node {
                    id
                    name
                }
            }
        }
    }
`;

export const CREATE_COLOR = gql`
    mutation Stone_Color_Create($input: StoneColorInput!) {
        stoneColorCreate(input: $input) {
            stoneColor {
                name
                id
                slug
            }
        }
    }
`;

export const UPDATE_COLOR = gql`
    mutation Stone_Color_Update($id: ID!, $input: StoneColorInput!) {
        stoneColorUpdate(id: $id, input: $input) {
            stoneColor {
                id
                name
                slug
            }
        }
    }
`;

export const DELETE_COLOR = gql`
    mutation Stone_Color_Delete($id: ID!) {
        stoneColorDelete(id: $id) {
            errors {
                message
            }
        }
    }
`;

export const CREATE_STONE = gql`
    mutation CreateStoneType($input: ProductStoneTypeInput!) {
        productStoneTypeCreate(input: $input) {
            productStoneType {
                id
                name
                slug
            }
        }
    }
`;

export const UPDATE_STONE = gql`
    mutation UpdateStoneType($id: ID!, $input: ProductStoneTypeInput!) {
        productStoneTypeUpdate(id: $id, input: $input) {
            productStoneType {
                id
                name
                slug
            }
        }
    }
`;

export const DELETE_STONE = gql`
    mutation ProductStoneTypeDelete($id: ID!) {
        productStoneTypeDelete(id: $id) {
            ok
        }
    }
`;

export const STYLE_LIST = gql`
    query GetProductStyles {
        productStyles(first: 100) {
            edges {
                node {
                    id
                    name
                    slug
                }
            }
            totalCount
        }
    }
`;

export const CREATE_STYLE = gql`
    mutation ProductStyleCreate($input: ProductStyleInput!) {
        productStyleCreate(input: $input) {
            productStyle {
                id
                name
                slug
            }
        }
    }
`;

export const UPDATE_STYLE = gql`
    mutation ProductStyleUpdate($id: ID!, $input: ProductStyleInput!) {
        productStyleUpdate(id: $id, input: $input) {
            productStyle {
                id
                name
                slug
            }
        }
    }
`;

export const DELETE_STYLE = gql`
    mutation ProductStyleDelete($id: ID!) {
        productStyleDelete(id: $id) {
            errors {
                message
            }
        }
    }
`;

export const CREATE_PAYMENT = gql`
    mutation PaymentGatewayCreate($input: PaymentGatewayInput!) {
        paymentGatewayCreate(input: $input) {
            paymentGateway {
                id
                name
                isActive
                description
            }
        }
    }
`;

export const CREATE_COUPEN = gql`
    mutation VoucherCreate($input: VoucherInput!) {
        voucherCreate(input: $input) {
            errors {
                ...DiscountError
                voucherCodes
                __typename
            }
            voucher {
                ...Voucher
                __typename
            }
            __typename
        }
    }

    fragment DiscountError on DiscountError {
        code
        field
        channels
        message
        __typename
    }

    fragment Voucher on Voucher {
        ...Metadata
        id
        name
        startDate
        endDate
        usageLimit
        type
        discountValueType
        countries {
            code
            country
            __typename
        }
        minCheckoutItemsQuantity
        channelListings {
            id
            channel {
                id
                name
                currencyCode
                __typename
            }
            discountValue
            currency
            minSpent {
                amount
                currency
                __typename
            }
            __typename
        }
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }
`;

export const ASSIGN_TO_COUPON = gql`
    mutation VoucherCataloguesAdd(
        $input: CatalogueInput!
        $id: ID!
        $after: String
        $before: String
        $first: Int
        $last: Int
        $includeProducts: Boolean!
        $includeCollections: Boolean!
        $includeCategories: Boolean!
    ) {
        voucherCataloguesAdd(id: $id, input: $input) {
            errors {
                ...DiscountError
                __typename
            }
            voucher {
                ...VoucherDetails
                __typename
            }
            __typename
        }
    }

    fragment DiscountError on DiscountError {
        code
        field
        channels
        message
        __typename
    }

    fragment VoucherDetails on Voucher {
        ...Voucher
        usageLimit
        used
        applyOncePerOrder
        applyOncePerCustomer
        onlyForStaff
        singleUse
        productsCount: products {
            totalCount
            __typename
        }
        collectionsCount: collections {
            totalCount
            __typename
        }
        categoriesCount: categories {
            totalCount
            __typename
        }
        products(after: $after, before: $before, first: $first, last: $last) @include(if: $includeProducts) {
            edges {
                node {
                    id
                    name
                    productType {
                        id
                        name
                        __typename
                    }
                    thumbnail {
                        url
                        __typename
                    }
                    channelListings {
                        ...ChannelListingProductWithoutPricing
                        __typename
                    }
                    __typename
                }
                __typename
            }
            pageInfo {
                ...PageInfo
                __typename
            }
            __typename
        }
        collections(after: $after, before: $before, first: $first, last: $last) @include(if: $includeCollections) {
            edges {
                node {
                    id
                    name
                    products {
                        totalCount
                        __typename
                    }
                    __typename
                }
                __typename
            }
            pageInfo {
                ...PageInfo
                __typename
            }
            __typename
        }
        categories(after: $after, before: $before, first: $first, last: $last) @include(if: $includeCategories) {
            edges {
                node {
                    id
                    name
                    products {
                        totalCount
                        __typename
                    }
                    __typename
                }
                __typename
            }
            pageInfo {
                ...PageInfo
                __typename
            }
            __typename
        }
        __typename
    }

    fragment Voucher on Voucher {
        ...Metadata
        id
        name
        startDate
        endDate
        usageLimit
        type
        discountValueType
        countries {
            code
            country
            __typename
        }
        minCheckoutItemsQuantity
        channelListings {
            id
            channel {
                id
                name
                currencyCode
                __typename
            }
            discountValue
            currency
            minSpent {
                amount
                currency
                __typename
            }
            __typename
        }
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }

    fragment ChannelListingProductWithoutPricing on ProductChannelListing {
        isPublished
        publicationDate
        isAvailableForPurchase
        availableForPurchase
        visibleInListings
        channel {
            id
            name
            currencyCode
            __typename
        }
        __typename
    }

    fragment PageInfo on PageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
        __typename
    }
`;

export const REMOVE_TO_COUPON = gql`
    mutation VoucherCataloguesRemove(
        $input: CatalogueInput!
        $id: ID!
        $after: String
        $before: String
        $first: Int
        $last: Int
        $includeProducts: Boolean!
        $includeCollections: Boolean!
        $includeCategories: Boolean!
    ) {
        voucherCataloguesRemove(id: $id, input: $input) {
            errors {
                ...DiscountError
                __typename
            }
            voucher {
                ...VoucherDetails
                __typename
            }
            __typename
        }
    }

    fragment DiscountError on DiscountError {
        code
        field
        channels
        message
        __typename
    }

    fragment VoucherDetails on Voucher {
        ...Voucher
        usageLimit
        used
        applyOncePerOrder
        applyOncePerCustomer
        onlyForStaff
        singleUse
        productsCount: products {
            totalCount
            __typename
        }
        collectionsCount: collections {
            totalCount
            __typename
        }
        categoriesCount: categories {
            totalCount
            __typename
        }
        products(after: $after, before: $before, first: $first, last: $last) @include(if: $includeProducts) {
            edges {
                node {
                    id
                    name
                    productType {
                        id
                        name
                        __typename
                    }
                    thumbnail {
                        url
                        __typename
                    }
                    channelListings {
                        ...ChannelListingProductWithoutPricing
                        __typename
                    }
                    __typename
                }
                __typename
            }
            pageInfo {
                ...PageInfo
                __typename
            }
            __typename
        }
        collections(after: $after, before: $before, first: $first, last: $last) @include(if: $includeCollections) {
            edges {
                node {
                    id
                    name
                    products {
                        totalCount
                        __typename
                    }
                    __typename
                }
                __typename
            }
            pageInfo {
                ...PageInfo
                __typename
            }
            __typename
        }
        categories(after: $after, before: $before, first: $first, last: $last) @include(if: $includeCategories) {
            edges {
                node {
                    id
                    name
                    products {
                        totalCount
                        __typename
                    }
                    __typename
                }
                __typename
            }
            pageInfo {
                ...PageInfo
                __typename
            }
            __typename
        }
        __typename
    }

    fragment Voucher on Voucher {
        ...Metadata
        id
        name
        startDate
        endDate
        usageLimit
        type
        discountValueType
        countries {
            code
            country
            __typename
        }
        minCheckoutItemsQuantity
        channelListings {
            id
            channel {
                id
                name
                currencyCode
                __typename
            }
            discountValue
            currency
            minSpent {
                amount
                currency
                __typename
            }
            __typename
        }
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }

    fragment ChannelListingProductWithoutPricing on ProductChannelListing {
        isPublished
        publicationDate
        isAvailableForPurchase
        availableForPurchase
        visibleInListings
        channel {
            id
            name
            currencyCode
            __typename
        }
        __typename
    }

    fragment PageInfo on PageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
        __typename
    }
`;

export const COUPON_LIST = gql`
    query VoucherList($after: String, $before: String, $first: Int, $last: Int, $filter: VoucherFilterInput, $sort: VoucherSortingInput, $channel: String) {
        vouchers(after: $after, before: $before, first: $first, last: $last, filter: $filter, sortBy: $sort, channel: $channel) {
            edges {
                node {
                    ...Voucher
                    __typename
                }
                __typename
            }
            pageInfo {
                ...PageInfo
                __typename
            }
            __typename
        }
    }

    fragment Voucher on Voucher {
        ...Metadata
        id
        name
        autoApply
        startDate
        endDate
        usageLimit
        used
        singleUse
        type
        discountValueType
        countries {
            code
            country
            __typename
        }
        minCheckoutItemsQuantity
        channelListings {
            id
            channel {
                id
                name
                currencyCode
                __typename
            }
            discountValue
            currency
            minSpent {
                amount
                currency
                __typename
            }
            __typename
        }
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }

    fragment PageInfo on PageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
        __typename
    }
`;

export const COUPEN_DETAILS = gql`
    query VoucherDetails($id: ID!, $after: String, $before: String, $first: Int, $last: Int, $includeProducts: Boolean!, $includeCollections: Boolean!, $includeCategories: Boolean!) {
        voucher(id: $id) {
            ...VoucherDetails
            metadata {
                key
                value
            }
            __typename
            excludeCategories(first: 500) {
                edges {
                    node {
                        backgroundImageUrl
                        name
                        id
                    }
                }
            }
        }
    }

    fragment VoucherDetails on Voucher {
        ...Voucher
        usageLimit
        used
        applyOncePerOrder
        applyOncePerCustomer
        onlyForStaff
        singleUse
        productsCount: products {
            totalCount
            __typename
        }
        collectionsCount: collections {
            totalCount
            __typename
        }
        categoriesCount: categories {
            totalCount
            __typename
        }
        products(after: $after, before: $before, first: $first, last: $last) @include(if: $includeProducts) {
            edges {
                node {
                    id
                    name
                    productType {
                        id
                        name
                        __typename
                    }
                    thumbnail {
                        url
                        __typename
                    }
                    channelListings {
                        ...ChannelListingProductWithoutPricing
                        __typename
                    }
                    __typename
                }
                __typename
            }
            pageInfo {
                ...PageInfo
                __typename
            }
            __typename
        }
        collections(after: $after, before: $before, first: $first, last: $last) @include(if: $includeCollections) {
            edges {
                node {
                    id
                    name
                    products {
                        totalCount
                        __typename
                    }
                    __typename
                }
                __typename
            }
            pageInfo {
                ...PageInfo
                __typename
            }
            __typename
        }
        categories(after: $after, before: $before, first: $first, last: $last) @include(if: $includeCategories) {
            edges {
                node {
                    id
                    name
                    products {
                        totalCount
                        __typename
                    }
                    __typename
                }
                __typename
            }
            pageInfo {
                ...PageInfo
                __typename
            }
            __typename
        }
        __typename
        autoApply
        invidualUseOnly
    }

    fragment Voucher on Voucher {
        id
        name
        startDate
        endDate
        usageLimit
        type
        discountValueType
        countries {
            code
            country
            __typename
        }
        minCheckoutItemsQuantity
        channelListings {
            id
            channel {
                id
                name
                currencyCode
                __typename
            }
            discountValue
            currency
            minSpent {
                amount
                currency
                __typename
            }
            maxSpent {
                amount
                currency
                __typename
            }
            __typename
        }
        __typename
    }

    fragment ChannelListingProductWithoutPricing on ProductChannelListing {
        isPublished
        publicationDate
        isAvailableForPurchase
        availableForPurchase
        visibleInListings
        channel {
            id
            name
            currencyCode
            __typename
        }
        __typename
    }

    fragment PageInfo on PageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
        __typename
    }
`;

export const COUPON_CODES = gql`
    query VoucherCodes($id: ID!, $after: String, $before: String, $first: Int, $last: Int) {
        voucher(id: $id) {
            codes(first: $first, last: $last, before: $before, after: $after) {
                edges {
                    node {
                        ...VoucherCode
                        __typename
                    }
                    __typename
                }
                pageInfo {
                    ...PageInfo
                    __typename
                }
                __typename
            }
            __typename
        }
    }

    fragment VoucherCode on VoucherCode {
        code
        used
        isActive
        __typename
    }

    fragment PageInfo on PageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
        __typename
    }
`;

export const COUPON_META_DATA = gql`
    mutation UpdateMetadata($id: ID!, $input: [MetadataInput!]!, $keysToDelete: [String!]!) {
        updateMetadata(id: $id, input: $input) {
            errors {
                ...MetadataError
                __typename
            }
            item {
                ...Metadata
                ... on Node {
                    id
                    __typename
                }
                __typename
            }
            __typename
        }
        deleteMetadata(id: $id, keys: $keysToDelete) {
            errors {
                ...MetadataError
                __typename
            }
            item {
                ...Metadata
                ... on Node {
                    id
                    __typename
                }
                __typename
            }
            __typename
        }
    }

    fragment MetadataError on MetadataError {
        code
        field
        message
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }
`;

export const COUPON_CHANNEL_UPDATE = gql`
    mutation VoucherChannelListingUpdate($id: ID!, $input: VoucherChannelListingInput!) {
        voucherChannelListingUpdate(id: $id, input: $input) {
            errors {
                ...DiscountError
                __typename
            }
            voucher {
                ...Voucher
                __typename
            }
            __typename
        }
    }

    fragment DiscountError on DiscountError {
        code
        field
        channels
        message
        __typename
    }

    fragment Voucher on Voucher {
        ...Metadata
        id
        name
        startDate
        endDate
        usageLimit
        type
        discountValueType
        countries {
            code
            country
            __typename
        }
        minCheckoutItemsQuantity
        channelListings {
            id
            channel {
                id
                name
                currencyCode
                __typename
            }
            discountValue
            currency
            minSpent {
                amount
                currency
                __typename
            }
            __typename
        }
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }
`;

export const SEARCH_CATEGORIES = gql`
    query SearchCategories($after: String, $first: Int!, $query: String!) {
        search: categories(after: $after, first: $first, filter: { search: $query }) {
            edges {
                node {
                    id
                    name
                    __typename
                }
                __typename
            }
            pageInfo {
                ...PageInfo
                __typename
            }
            __typename
        }
    }

    fragment PageInfo on PageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
        __typename
    }
`;

export const SEARCH_PRODUCT = gql`
    query SearchProducts($after: String, $first: Int!, $query: String!, $channel: String) {
        search: products(after: $after, first: $first, filter: { search: $query }, channel: $channel) {
            edges {
                node {
                    id
                    name
                    thumbnail {
                        url
                        __typename
                    }
                    variants {
                        id
                        name
                        sku
                        channelListings {
                            channel {
                                id
                                isActive
                                name
                                currencyCode
                                __typename
                            }
                            price {
                                amount
                                currency
                                __typename
                            }
                            __typename
                        }
                        __typename
                    }
                    collections {
                        id
                        __typename
                    }
                    __typename
                }
                __typename
            }
            pageInfo {
                ...PageInfo
                __typename
            }
            __typename
        }
    }

    fragment PageInfo on PageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
        __typename
    }
`;

export const UPDATE_COUPON = gql`
    mutation VoucherUpdate($input: VoucherInput!, $id: ID!) {
        voucherUpdate(id: $id, input: $input) {
            errors {
                ...DiscountError
                voucherCodes
                __typename
            }
            voucher {
                ...Voucher
                __typename
            }
            __typename
        }
    }

    fragment DiscountError on DiscountError {
        code
        field
        channels
        message
        __typename
    }

    fragment Voucher on Voucher {
        ...Metadata
        id
        name
        startDate
        endDate
        usageLimit
        type
        discountValueType
        countries {
            code
            country
            __typename
        }
        minCheckoutItemsQuantity
        channelListings {
            id
            channel {
                id
                name
                currencyCode
                __typename
            }
            discountValue
            currency
            minSpent {
                amount
                currency
                __typename
            }
            __typename
        }
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }
`;

export const COUPON_DELETE = gql`
    mutation VoucherBulkDelete($ids: [ID!]!) {
        voucherBulkDelete(ids: $ids) {
            errors {
                ...VoucherBulkDeleteError
                __typename
            }
            __typename
        }
    }

    fragment VoucherBulkDeleteError on DiscountError {
        code
        field
        message
        __typename
    }
`;

export const PRODUCT_LOG = gql`
    query ProductLogs($productid: ID!, $first: Int, $after: String, $last: Int, $before: String) {
        productlogs(id: $productid, first: $first, after: $after, last: $last, before: $before) {
            edges {
                node {
                    log
                    date
                }
            }
            pageInfo {
                hasNextPage
                hasPreviousPage
                startCursor
                endCursor
            }
        }
    }
`;

export const ABANDONT_CART_LIST = gql`
    query AbandonedCarts($first: Int, $after: String, $last: Int, $before: String) {
        abandonedCarts(first: $first, after: $after, last: $last, before: $before) {
            edges {
                node {
                    id
                    logNote
                    time
                    customer {
                        email
                        firstName
                        lastName
                        id
                        __typename
                    }
                    __typename
                    productName
                    productId
                }
                __typename
            }
            pageInfo {
                endCursor
                startCursor
                hasNextPage
                hasPreviousPage
                __typename
            }
            __typename
        }
    }
`;

export const UPDATE_PAYMENT = gql`
    mutation PaymentGatewayCreate($id: ID!, $input: PaymentGatewayInput!) {
        paymentGatewayUpdate(id: $id, input: $input) {
            paymentGateway {
                id
                name
                isActive
                description
            }
        }
    }
`;

export const PRODUCT_EXPORT = gql`
    query ProductVariantsExport($first: Int!, $after: String, $categories: [ID!]!) {
        productVariants(first: $first, after: $after, channel: "india-channel", categories: $categories) {
            edges {
                node {
                    id
                    name
                    sku
                    stocks {
                        quantity
                    }
                    media {
                        url
                    }
                    pricing {
                        price {
                            gross {
                                amount
                                currency
                            }
                        }
                    }
                    product {
                        category {
                            name
                            parent {
                                name
                            }
                        }
                        name
                        orderNo
                        description
                        media {
                            url
                        }
                        slug
                        prouctDesign {
                            name
                        }
                        productstyle {
                            name
                        }
                        productStonecolor {
                            name
                        }
                        productStoneType {
                            name
                        }
                        productSize {
                            name
                        }
                        productItemtype {
                            name
                        }
                        productFinish {
                            name
                        }
                        getCrosssells {
                            name
                        }
                        getUpsells {
                            name
                        }
                        tags {
                            name
                        }
                        taxClass {
                            name
                        }
                        metadata {
                            key
                            value
                        }
                        channelListings {
                            isPublished
                        }
                        productId
                        attributes {
                            attribute {
                                name
                                slug
                            }
                            values {
                                name
                                slug
                            }
                        }
                    }
                }
            }
            pageInfo {
                endCursor
                hasNextPage
                hasPreviousPage
                startCursor
            }
        }
    }
`;

export const ORDER_LIST = gql`
    query OrderList($first: Int, $after: String, $last: Int, $before: String, $filter: OrderFilterInput, $sort: OrderSortingInput) {
        orders(before: $before, after: $after, first: $first, last: $last, filter: $filter, sortBy: $sort) {
            totalCount
            edges {
                node {
                    __typename
                    transactions {
                        id
                    }
                    billingAddress {
                        ...Address
                        __typename
                    }
                    created
                    id
                    number
                    paymentStatus
                    status
                    total {
                        __typename
                        gross {
                            __typename
                            amount
                            currency
                        }
                        tax {
                            __typename
                            amount
                            currency
                        }
                    }
                    userEmail
                    invoices {
                        number
                        url
                        id
                    }
                    courierPartner {
                        name
                        trackingUrl
                        id
                    }
                    fulfillments {
                        id
                        trackingNumber
                    }
                    user {
                        id
                        lastName
                        firstName
                    }
                    shippingPrice {
                        gross {
                            amount
                            currency
                        }
                    }
                    lines {
                        id
                        productName
                        productSku
                        totalPrice {
                            gross {
                                amount
                                currency
                            }
                        }
                    }
                    shippingAddress {
                        ...Address
                        city
                        cityArea
                        companyName
                        country {
                            code
                            country
                        }
                        countryArea
                        firstName
                        id
                        lastName
                        phone
                        streetAddress1
                        streetAddress2
                    }
                    origin
                    totalRefunded {
                        amount
                        currency
                    }
                }
                __typename
            }
            pageInfo {
                hasPreviousPage
                hasNextPage
                startCursor
                endCursor
                __typename
            }
            __typename
        }
    }

    fragment Address on Address {
        city
        cityArea
        companyName
        country {
            __typename
            code
            country
        }
        countryArea
        firstName
        id
        lastName
        phone
        postalCode
        streetAddress1
        streetAddress2
        __typename
    }
`;

export const SHIPPING_LIST = gql`
    query GetShippingCarrier {
        shippingCarriers(first: 100) {
            edges {
                node {
                    id
                    name
                    trackingUrl
                }
            }
        }
    }
`;

export const ORDER_DETAILS_GRAND_REFUND = gql`
    query OrderDetailsGrantRefund($id: ID!) {
        order(id: $id) {
            ...OrderDetailsGrantRefund
            __typename
        }
    }

    fragment OrderDetailsGrantRefund on Order {
        id
        number
        lines {
            ...OrderLineGrantRefund
            __typename
        }
        fulfillments {
            ...OrderFulfillmentGrantRefund
            __typename
        }
        shippingPrice {
            gross {
                ...Money
                __typename
            }
            __typename
        }
        total {
            gross {
                ...Money
                __typename
            }
            __typename
        }
        grantedRefunds {
            ...OrderDetailsGrantedRefund
            __typename
        }
        __typename
    }

    fragment OrderLineGrantRefund on OrderLine {
        id
        thumbnail {
            url
            __typename
        }
        variant {
            product {
                thumbnail {
                    url
                    alt
                }
            }
        }
        productName
        quantity
        quantityToFulfill
        variantName
        productName
        unitPrice {
            gross {
                ...Money
                __typename
            }
            __typename
        }
        __typename
    }

    fragment Money on Money {
        amount
        currency
        __typename
    }

    fragment OrderFulfillmentGrantRefund on Fulfillment {
        id
        fulfillmentOrder
        status
        lines {
            id
            quantity
            orderLine {
                ...OrderLineGrantRefund
                __typename
            }
            __typename
        }
        __typename
    }

    fragment OrderDetailsGrantedRefund on OrderGrantedRefund {
        id
        reason
        amount {
            ...Money
            __typename
        }
        shippingCostsIncluded
        lines {
            id
            quantity
            orderLine {
                ...OrderLine
                __typename
            }
            __typename
        }
        __typename
    }

    fragment OrderLine on OrderLine {
        id
        isShippingRequired
        allocations {
            id
            quantity
            warehouse {
                id
                name
                __typename
            }
            __typename
        }
        variant {
            id
            name
            quantityAvailable
            preorder {
                endDate
                __typename
            }
            stocks {
                ...Stock
                __typename
            }
            product {
                id
                isAvailableForPurchase
                __typename
            }
            __typename
        }
        productName
        productSku
        quantity
        quantityFulfilled
        quantityToFulfill
        totalPrice {
            ...TaxedMoney
            __typename
        }
        unitDiscount {
            amount
            currency
            __typename
        }
        unitDiscountValue
        unitDiscountReason
        unitDiscountType
        undiscountedUnitPrice {
            currency
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        unitPrice {
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        thumbnail {
            url
            __typename
        }
        __typename
    }

    fragment Stock on Stock {
        id
        quantity
        quantityAllocated
        warehouse {
            ...Warehouse
            __typename
        }
        __typename
    }

    fragment Warehouse on Warehouse {
        id
        name
        __typename
    }

    fragment TaxedMoney on TaxedMoney {
        net {
            ...Money
            __typename
        }
        gross {
            ...Money
            __typename
        }
        __typename
    }
`;

export const LAST_UPDATE_DETAILS = gql`
    mutation {
        stockUpdate {
            dates
            quantityList
            productNameList
            productIdList
            total
            __typename
        }
    }
`;

export const PAYMENT_LIST = gql`
    query GetPaymnetGatewayList {
        paymentGateways(first: 10) {
            edges {
                node {
                    description
                    id
                    isActive
                    name
                }
            }
        }
    }
`;

export const CREATE_INVOICE = gql`
    mutation InvoiceRequest($orderId: ID!) {
        invoiceRequest(orderId: $orderId) {
            errors {
                ...InvoiceError
                __typename
            }
            invoice {
                ...Invoice
                __typename
            }
            order {
                id
                invoices {
                    ...Invoice
                    __typename
                }
                __typename
            }
            __typename
        }
    }

    fragment InvoiceError on InvoiceError {
        code
        field
        message
        __typename
    }

    fragment Invoice on Invoice {
        id
        number
        createdAt
        url
        status
        __typename
    }
`;

export const UPDATE_INVOICE = gql`
    mutation InvoiceUpdate($invoiceid: ID!, $input: UpdateInvoiceInput!) {
        invoiceUpdate(id: $invoiceid, input: $input) {
            errors {
                message
            }
            invoice {
                createdAt
            }
        }
    }
`;

export const UPDATE_PAYSLIP = gql`
    mutation OrderUpdateMetadata($id: ID!, $input: [MetadataInput!]!, $keysToDelete: [String!]!) {
        updateMetadata(id: $id, input: $input) {
            errors {
                ...MetadataError
                __typename
            }
            item {
                ...Metadata
                ... on Node {
                    id
                    __typename
                }
                __typename
            }
            __typename
        }
        deleteMetadata(id: $id, keys: $keysToDelete) {
            errors {
                ...MetadataError
                __typename
            }
            item {
                ...Metadata
                ... on Node {
                    id
                    __typename
                }
                __typename
            }
            __typename
        }
    }

    fragment MetadataError on MetadataError {
        code
        field
        message
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }
`;

export const ORDER_FULFILL_SETTING = gql`
    query OrderFulfillSettings {
        shop {
            ...ShopOrderSettings
            __typename
        }
    }

    fragment ShopOrderSettings on Shop {
        fulfillmentAutoApprove
        fulfillmentAllowUnpaid
        __typename
    }
`;

export const CREATE_PAYSLIP = gql`
    mutation InvoiceRequest($orderId: ID!) {
        payslipRequest(orderId: $orderId) {
            errors {
                ...PayslipError
                __typename
            }

            order {
                id
                metadata {
                    key
                    value
                }

                __typename
            }
            __typename
        }
    }

    fragment PayslipError on InvoiceError {
        code
        field
        message
        __typename
    }
`;

export const ORDER_FULFILL_DATA = gql`
    query OrderFulfillData($orderId: ID!) {
        order(id: $orderId) {
            id
            isPaid
            deliveryMethod {
                __typename
                ... on ShippingMethod {
                    id
                    __typename
                }
                ... on Warehouse {
                    id
                    clickAndCollectOption
                    __typename
                }
            }
            lines {
                ...OrderFulfillLine
                __typename
            }
            number
            __typename
        }
    }

    fragment OrderFulfillLine on OrderLine {
        id
        isShippingRequired
        productName
        quantity
        allocations {
            id
            quantity
            warehouse {
                id
                name
                __typename
            }
            __typename
        }
        quantityFulfilled
        quantityToFulfill
        variant {
            id
            name
            sku
            preorder {
                endDate
                __typename
            }
            attributes {
                values {
                    id
                    name
                    __typename
                }
                __typename
            }
            stocks {
                ...Stock
                __typename
            }
            trackInventory
            __typename
            images {
                url
            }
            product {
                thumbnail {
                    url
                }
            }
        }
        thumbnail(size: 64) {
            url
            __typename
        }
        __typename
    }

    fragment Stock on Stock {
        id
        quantity
        quantityAllocated
        warehouse {
            ...Warehouse
            __typename
        }
        __typename
    }

    fragment Warehouse on Warehouse {
        id
        name
        __typename
    }
`;

export const UPDATE_SHIPPING_PROVIDER = gql`
    mutation OrderUpdate($input: OrderUpdateInput!, $orderId: ID!) {
        orderUpdate(input: $input, id: $orderId) {
            order {
                id
                number
                courierPartner {
                    name
                    id
                    trackingUrl
                }
            }
            errors {
                message
            }
        }
    }
`;

export const DRAFT_ORDER_CANCEL = gql`
    mutation OrderCancel($id: ID!) {
        orderCancel(id: $id) {
            errors {
                ...OrderError
                __typename
            }
            order {
                ...OrderDetails
                __typename
            }
            __typename
        }
    }

    fragment OrderError on OrderError {
        code
        field
        addressType
        message
        orderLines
        __typename
    }

    fragment OrderDetails on Order {
        id
        token
        ...Metadata
        billingAddress {
            ...Address
            __typename
        }
        transactions {
            ...TransactionItem
            __typename
        }
        payments {
            ...OrderPayment
            __typename
        }
        giftCards {
            ...OrderGiftCard
            __typename
        }
        grantedRefunds {
            ...OrderGrantedRefund
            __typename
        }
        isShippingRequired
        canFinalize
        created
        customerNote
        discounts {
            id
            type
            calculationMode: valueType
            value
            reason
            amount {
                ...Money
                __typename
            }
            __typename
        }
        events {
            ...OrderEvent
            __typename
        }
        fulfillments {
            ...Fulfillment
            __typename
        }
        lines {
            ...OrderLine
            __typename
        }
        number
        isPaid
        paymentStatus
        shippingAddress {
            ...Address
            __typename
        }
        deliveryMethod {
            __typename
            ... on ShippingMethod {
                id
                __typename
            }
            ... on Warehouse {
                id
                clickAndCollectOption
                __typename
            }
        }
        shippingMethod {
            id
            __typename
        }
        shippingMethodName
        collectionPointName
        shippingPrice {
            gross {
                amount
                currency
                __typename
            }
            __typename
        }
        status
        subtotal {
            gross {
                ...Money
                __typename
            }
            net {
                ...Money
                __typename
            }
            __typename
        }
        total {
            gross {
                ...Money
                __typename
            }
            net {
                ...Money
                __typename
            }
            tax {
                ...Money
                __typename
            }
            __typename
        }
        totalRemainingGrant {
            ...Money
            __typename
        }
        totalGrantedRefund {
            ...Money
            __typename
        }
        totalRefundPending {
            ...Money
            __typename
        }
        totalRefunded {
            ...Money
            __typename
        }
        actions
        totalAuthorizePending {
            ...Money
            __typename
        }
        totalAuthorized {
            ...Money
            __typename
        }
        totalCaptured {
            ...Money
            __typename
        }
        totalCharged {
            ...Money
            __typename
        }
        totalChargePending {
            ...Money
            __typename
        }
        totalCanceled {
            ...Money
            __typename
        }
        totalCancelPending {
            ...Money
            __typename
        }
        totalBalance {
            ...Money
            __typename
        }
        undiscountedTotal {
            net {
                ...Money
                __typename
            }
            gross {
                ...Money
                __typename
            }
            __typename
        }
        user {
            id
            email
            __typename
        }
        userEmail
        shippingMethods {
            id
            name
            price {
                ...Money
                __typename
            }
            active
            message
            __typename
        }
        invoices {
            ...Invoice
            __typename
        }
        channel {
            isActive
            id
            name
            currencyCode
            slug
            defaultCountry {
                code
                __typename
            }
            orderSettings {
                markAsPaidStrategy
                __typename
            }
            __typename
        }
        isPaid
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }

    fragment Address on Address {
        city
        cityArea
        companyName
        country {
            __typename
            code
            country
        }
        countryArea
        firstName
        id
        lastName
        phone
        postalCode
        streetAddress1
        streetAddress2
        __typename
    }

    fragment TransactionItem on TransactionItem {
        id
        pspReference
        actions
        name
        externalUrl
        events {
            ...TransactionEvent
            __typename
        }
        authorizedAmount {
            ...Money
            __typename
        }
        chargedAmount {
            ...Money
            __typename
        }
        refundedAmount {
            ...Money
            __typename
        }
        canceledAmount {
            ...Money
            __typename
        }
        authorizePendingAmount {
            ...Money
            __typename
        }
        chargePendingAmount {
            ...Money
            __typename
        }
        refundPendingAmount {
            ...Money
            __typename
        }
        cancelPendingAmount {
            ...Money
            __typename
        }
        __typename
    }

    fragment TransactionEvent on TransactionEvent {
        id
        pspReference
        amount {
            ...Money
            __typename
        }
        type
        message
        createdAt
        createdBy {
            ... on User {
                ...StaffMemberAvatar
                __typename
            }
            ... on App {
                ...AppAvatar
                __typename
            }
            __typename
        }
        externalUrl
        __typename
    }

    fragment Money on Money {
        amount
        currency
        __typename
    }

    fragment StaffMemberAvatar on User {
        ...StaffMember
        avatar(size: 512) {
            url
            __typename
        }
        __typename
    }

    fragment StaffMember on User {
        id
        email
        firstName
        isActive
        lastName
        __typename
    }

    fragment AppAvatar on App {
        id
        name
        __typename
    }

    fragment OrderPayment on Payment {
        id
        isActive
        actions
        gateway
        paymentMethodType
        availableCaptureAmount {
            ...Money
            __typename
        }
        capturedAmount {
            ...Money
            __typename
        }
        total {
            ...Money
            __typename
        }
        availableRefundAmount {
            ...Money
            __typename
        }
        modified
        transactions {
            id
            token
            created
            kind
            isSuccess
            __typename
        }
        __typename
    }

    fragment OrderGiftCard on GiftCard {
        id
        last4CodeChars
        events {
            id
            type
            orderId
            date
            balance {
                initialBalance {
                    ...Money
                    __typename
                }
                currentBalance {
                    ...Money
                    __typename
                }
                oldInitialBalance {
                    ...Money
                    __typename
                }
                oldCurrentBalance {
                    ...Money
                    __typename
                }
                __typename
            }
            __typename
        }
        __typename
    }

    fragment OrderGrantedRefund on OrderGrantedRefund {
        id
        createdAt
        shippingCostsIncluded
        amount {
            currency
            amount
            __typename
        }
        reason
        user {
            ...UserBaseAvatar
            __typename
        }
        app {
            id
            name
            __typename
        }
        __typename
    }

    fragment UserBaseAvatar on User {
        id
        firstName
        lastName
        email
        avatar {
            url
            alt
            __typename
        }
        __typename
    }

    fragment OrderEvent on OrderEvent {
        id
        amount
        shippingCostsIncluded
        date
        email
        emailType
        invoiceNumber
        discount {
            valueType
            value
            reason
            amount {
                amount
                currency
                __typename
            }
            oldValueType
            oldValue
            oldAmount {
                amount
                currency
                __typename
            }
            __typename
        }
        relatedOrder {
            id
            number
            __typename
        }
        message
        quantity
        transactionReference
        type
        user {
            id
            email
            firstName
            lastName
            __typename
        }
        app {
            id
            name
            appUrl
            __typename
        }
        lines {
            quantity
            itemName
            discount {
                valueType
                value
                reason
                amount {
                    amount
                    currency
                    __typename
                }
                oldValueType
                oldValue
                oldAmount {
                    amount
                    currency
                    __typename
                }
                __typename
            }
            orderLine {
                id
                productName
                variantName
                __typename
            }
            __typename
        }
        __typename
    }

    fragment Fulfillment on Fulfillment {
        ...Metadata
        id
        lines {
            id
            quantity
            orderLine {
                ...OrderLine
                __typename
            }
            __typename
        }
        fulfillmentOrder
        status
        trackingNumber
        warehouse {
            id
            name
            __typename
        }
        __typename
    }

    fragment OrderLine on OrderLine {
        id
        isShippingRequired
        allocations {
            id
            quantity
            warehouse {
                id
                name
                __typename
            }
            __typename
        }
        variant {
            id
            name
            quantityAvailable
            preorder {
                endDate
                __typename
            }
            stocks {
                ...Stock
                __typename
            }
            product {
                id
                isAvailableForPurchase
                __typename
            }
            __typename
        }
        productName
        productSku
        quantity
        quantityFulfilled
        quantityToFulfill
        totalPrice {
            ...TaxedMoney
            __typename
        }
        unitDiscount {
            amount
            currency
            __typename
        }
        unitDiscountValue
        unitDiscountReason
        unitDiscountType
        undiscountedUnitPrice {
            currency
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        unitPrice {
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        thumbnail {
            url
            __typename
        }
        __typename
    }

    fragment Stock on Stock {
        id
        quantity
        quantityAllocated
        warehouse {
            ...Warehouse
            __typename
        }
        __typename
    }

    fragment Warehouse on Warehouse {
        id
        name
        __typename
    }

    fragment TaxedMoney on TaxedMoney {
        net {
            ...Money
            __typename
        }
        gross {
            ...Money
            __typename
        }
        __typename
    }

    fragment Invoice on Invoice {
        id
        number
        createdAt
        url
        status
        __typename
    }
`;

export const UPDATE_TRACKING_NUMBER = gql`
    mutation OrderFulfillmentUpdateTracking($id: ID!, $input: FulfillmentUpdateTrackingInput!) {
        orderFulfillmentUpdateTracking(id: $id, input: $input) {
            errors {
                ...OrderError
                __typename
            }
            order {
                ...OrderDetails
                __typename
            }
            __typename
        }
    }

    fragment OrderError on OrderError {
        code
        field
        addressType
        message
        orderLines
        __typename
    }

    fragment OrderDetails on Order {
        id
        token
        ...Metadata
        billingAddress {
            ...Address
            __typename
        }
        transactions {
            ...TransactionItem
            __typename
        }
        payments {
            ...OrderPayment
            __typename
        }
        giftCards {
            ...OrderGiftCard
            __typename
        }
        grantedRefunds {
            ...OrderGrantedRefund
            __typename
        }
        isShippingRequired
        canFinalize
        created
        customerNote
        discounts {
            id
            type
            calculationMode: valueType
            value
            reason
            amount {
                ...Money
                __typename
            }
            __typename
        }
        events {
            ...OrderEvent
            __typename
        }
        fulfillments {
            ...Fulfillment
            __typename
        }
        lines {
            ...OrderLine
            __typename
        }
        number
        isPaid
        paymentStatus
        shippingAddress {
            ...Address
            __typename
        }
        deliveryMethod {
            __typename
            ... on ShippingMethod {
                id
                __typename
            }
            ... on Warehouse {
                id
                clickAndCollectOption
                __typename
            }
        }
        shippingMethod {
            id
            __typename
        }
        shippingMethodName
        collectionPointName
        shippingPrice {
            gross {
                amount
                currency
                __typename
            }
            __typename
        }
        status
        subtotal {
            gross {
                ...Money
                __typename
            }
            net {
                ...Money
                __typename
            }
            __typename
        }
        total {
            gross {
                ...Money
                __typename
            }
            net {
                ...Money
                __typename
            }
            tax {
                ...Money
                __typename
            }
            __typename
        }
        totalRemainingGrant {
            ...Money
            __typename
        }
        totalGrantedRefund {
            ...Money
            __typename
        }
        totalRefundPending {
            ...Money
            __typename
        }
        totalRefunded {
            ...Money
            __typename
        }
        actions
        totalAuthorizePending {
            ...Money
            __typename
        }
        totalAuthorized {
            ...Money
            __typename
        }
        totalCaptured {
            ...Money
            __typename
        }
        totalCharged {
            ...Money
            __typename
        }
        totalChargePending {
            ...Money
            __typename
        }
        totalCanceled {
            ...Money
            __typename
        }
        totalCancelPending {
            ...Money
            __typename
        }
        totalBalance {
            ...Money
            __typename
        }
        undiscountedTotal {
            net {
                ...Money
                __typename
            }
            gross {
                ...Money
                __typename
            }
            __typename
        }
        user {
            id
            email
            __typename
        }
        userEmail
        shippingMethods {
            id
            name
            price {
                ...Money
                __typename
            }
            active
            message
            __typename
        }
        invoices {
            ...Invoice
            __typename
        }
        channel {
            isActive
            id
            name
            currencyCode
            slug
            defaultCountry {
                code
                __typename
            }
            orderSettings {
                markAsPaidStrategy
                __typename
            }
            __typename
        }
        isPaid
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }

    fragment Address on Address {
        city
        cityArea
        companyName
        country {
            __typename
            code
            country
        }
        countryArea
        firstName
        id
        lastName
        phone
        postalCode
        streetAddress1
        streetAddress2
        __typename
    }

    fragment TransactionItem on TransactionItem {
        id
        pspReference
        actions
        name
        externalUrl
        events {
            ...TransactionEvent
            __typename
        }
        authorizedAmount {
            ...Money
            __typename
        }
        chargedAmount {
            ...Money
            __typename
        }
        refundedAmount {
            ...Money
            __typename
        }
        canceledAmount {
            ...Money
            __typename
        }
        authorizePendingAmount {
            ...Money
            __typename
        }
        chargePendingAmount {
            ...Money
            __typename
        }
        refundPendingAmount {
            ...Money
            __typename
        }
        cancelPendingAmount {
            ...Money
            __typename
        }
        __typename
    }

    fragment TransactionEvent on TransactionEvent {
        id
        pspReference
        amount {
            ...Money
            __typename
        }
        type
        message
        createdAt
        createdBy {
            ... on User {
                ...StaffMemberAvatar
                __typename
            }
            ... on App {
                ...AppAvatar
                __typename
            }
            __typename
        }
        externalUrl
        __typename
    }

    fragment Money on Money {
        amount
        currency
        __typename
    }

    fragment StaffMemberAvatar on User {
        ...StaffMember
        avatar(size: 512) {
            url
            __typename
        }
        __typename
    }

    fragment StaffMember on User {
        id
        email
        firstName
        isActive
        lastName
        __typename
    }

    fragment AppAvatar on App {
        id
        name
        __typename
    }

    fragment OrderPayment on Payment {
        id
        isActive
        actions
        gateway
        paymentMethodType
        availableCaptureAmount {
            ...Money
            __typename
        }
        capturedAmount {
            ...Money
            __typename
        }
        total {
            ...Money
            __typename
        }
        availableRefundAmount {
            ...Money
            __typename
        }
        modified
        transactions {
            id
            token
            created
            kind
            isSuccess
            __typename
        }
        __typename
    }

    fragment OrderGiftCard on GiftCard {
        id
        last4CodeChars
        events {
            id
            type
            orderId
            date
            balance {
                initialBalance {
                    ...Money
                    __typename
                }
                currentBalance {
                    ...Money
                    __typename
                }
                oldInitialBalance {
                    ...Money
                    __typename
                }
                oldCurrentBalance {
                    ...Money
                    __typename
                }
                __typename
            }
            __typename
        }
        __typename
    }

    fragment OrderGrantedRefund on OrderGrantedRefund {
        id
        createdAt
        shippingCostsIncluded
        amount {
            currency
            amount
            __typename
        }
        reason
        user {
            ...UserBaseAvatar
            __typename
        }
        app {
            id
            name
            __typename
        }
        __typename
    }

    fragment UserBaseAvatar on User {
        id
        firstName
        lastName
        email
        avatar {
            url
            alt
            __typename
        }
        __typename
    }

    fragment OrderEvent on OrderEvent {
        id
        amount
        shippingCostsIncluded
        date
        email
        emailType
        invoiceNumber
        discount {
            valueType
            value
            reason
            amount {
                amount
                currency
                __typename
            }
            oldValueType
            oldValue
            oldAmount {
                amount
                currency
                __typename
            }
            __typename
        }
        relatedOrder {
            id
            number
            __typename
        }
        message
        quantity
        transactionReference
        type
        user {
            id
            email
            firstName
            lastName
            __typename
        }
        app {
            id
            name
            appUrl
            __typename
        }
        lines {
            quantity
            itemName
            discount {
                valueType
                value
                reason
                amount {
                    amount
                    currency
                    __typename
                }
                oldValueType
                oldValue
                oldAmount {
                    amount
                    currency
                    __typename
                }
                __typename
            }
            orderLine {
                id
                productName
                variantName
                __typename
            }
            __typename
        }
        __typename
    }

    fragment Fulfillment on Fulfillment {
        ...Metadata
        id
        lines {
            id
            quantity
            orderLine {
                ...OrderLine
                __typename
            }
            __typename
        }
        fulfillmentOrder
        status
        trackingNumber
        warehouse {
            id
            name
            __typename
        }
        __typename
    }

    fragment OrderLine on OrderLine {
        id
        isShippingRequired
        allocations {
            id
            quantity
            warehouse {
                id
                name
                __typename
            }
            __typename
        }
        variant {
            id
            name
            quantityAvailable
            preorder {
                endDate
                __typename
            }
            stocks {
                ...Stock
                __typename
            }
            product {
                id
                isAvailableForPurchase
                __typename
            }
            __typename
        }
        productName
        productSku
        quantity
        quantityFulfilled
        quantityToFulfill
        totalPrice {
            ...TaxedMoney
            __typename
        }
        unitDiscount {
            amount
            currency
            __typename
        }
        unitDiscountValue
        unitDiscountReason
        unitDiscountType
        undiscountedUnitPrice {
            currency
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        unitPrice {
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        thumbnail {
            url
            __typename
        }
        __typename
    }

    fragment Stock on Stock {
        id
        quantity
        quantityAllocated
        warehouse {
            ...Warehouse
            __typename
        }
        __typename
    }

    fragment Warehouse on Warehouse {
        id
        name
        __typename
    }

    fragment TaxedMoney on TaxedMoney {
        net {
            ...Money
            __typename
        }
        gross {
            ...Money
            __typename
        }
        __typename
    }

    fragment Invoice on Invoice {
        id
        number
        createdAt
        url
        status
        __typename
    }
`;

export const CUSTOMER_LIST = gql`
    query SearchCustomers($after: String, $first: Int!, $query: String!) {
        search: customers(after: $after, first: $first, filter: { search: $query }) {
            edges {
                node {
                    id
                    email
                    firstName
                    lastName
                    __typename
                }
                __typename
            }
            pageInfo {
                ...PageInfo
                __typename
            }
            __typename
        }
    }

    fragment PageInfo on PageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
        __typename
    }
`;

export const CREATE_SHIPPING = gql`
    mutation Shipping_CarrierCreate($input: Shipping_CarrierInput!) {
        shippingCarrierCreate(input: $input) {
            shippingCarrier {
                id
                name
                trackingUrl
            }
            errors {
                message
            }
        }
    }
`;


export const USER_INFO = gql`
    query {
    me {
      id
      email
      firstName
      lastName
      
    }
  }
`;

export const LOGOUT = gql`
    mutation {
        tokensDeactivateAll {
          errors {
            field
            message
            code
          }
        }
      }
`;

export const UPDATE_SHIPPING_COST = gql`
    mutation OrderShippingMethodUpdate($id: ID!, $input: OrderUpdateShippingInput!) {
        orderUpdateShipping(order: $id, input: $input) {
            errors {
                ...OrderError
                __typename
            }
            order {
                shippingMethods {
                    id
                    name
                    __typename
                }
                total {
                    tax {
                        amount
                        currency
                        __typename
                    }
                    gross {
                        amount
                        currency
                        __typename
                    }
                    __typename
                }
                id
                shippingMethod {
                    id
                    name
                    price {
                        amount
                        currency
                        __typename
                    }
                    __typename
                }
                shippingMethodName
                shippingPrice {
                    gross {
                        amount
                        currency
                        __typename
                    }
                    __typename
                }
                ...OrderDetails
                __typename
            }
            __typename
        }
    }

    fragment OrderError on OrderError {
        code
        field
        addressType
        message
        orderLines
        __typename
    }

    fragment OrderDetails on Order {
        id
        token
        ...Metadata
        billingAddress {
            ...Address
            __typename
        }
        transactions {
            ...TransactionItem
            __typename
        }
        payments {
            ...OrderPayment
            __typename
        }
        giftCards {
            ...OrderGiftCard
            __typename
        }
        grantedRefunds {
            ...OrderGrantedRefund
            __typename
        }
        isShippingRequired
        canFinalize
        created
        customerNote
        discounts {
            id
            type
            calculationMode: valueType
            value
            reason
            amount {
                ...Money
                __typename
            }
            __typename
        }
        events {
            ...OrderEvent
            __typename
        }
        fulfillments {
            ...Fulfillment
            __typename
        }
        lines {
            ...OrderLine
            __typename
        }
        number
        isPaid
        paymentStatus
        shippingAddress {
            ...Address
            __typename
        }
        deliveryMethod {
            __typename
            ... on ShippingMethod {
                id
                __typename
            }
            ... on Warehouse {
                id
                clickAndCollectOption
                __typename
            }
        }
        shippingMethod {
            id
            __typename
        }
        shippingMethodName
        collectionPointName
        shippingPrice {
            gross {
                amount
                currency
                __typename
            }
            __typename
        }
        status
        subtotal {
            gross {
                ...Money
                __typename
            }
            net {
                ...Money
                __typename
            }
            __typename
        }
        total {
            gross {
                ...Money
                __typename
            }
            net {
                ...Money
                __typename
            }
            tax {
                ...Money
                __typename
            }
            __typename
        }
        totalRemainingGrant {
            ...Money
            __typename
        }
        totalGrantedRefund {
            ...Money
            __typename
        }
        totalRefundPending {
            ...Money
            __typename
        }
        totalRefunded {
            ...Money
            __typename
        }
        actions
        totalAuthorizePending {
            ...Money
            __typename
        }
        totalAuthorized {
            ...Money
            __typename
        }
        totalCaptured {
            ...Money
            __typename
        }
        totalCharged {
            ...Money
            __typename
        }
        totalChargePending {
            ...Money
            __typename
        }
        totalCanceled {
            ...Money
            __typename
        }
        totalCancelPending {
            ...Money
            __typename
        }
        totalBalance {
            ...Money
            __typename
        }
        undiscountedTotal {
            net {
                ...Money
                __typename
            }
            gross {
                ...Money
                __typename
            }
            __typename
        }
        user {
            id
            email
            __typename
        }
        userEmail
        shippingMethods {
            id
            name
            price {
                ...Money
                __typename
            }
            active
            message
            __typename
        }
        invoices {
            ...Invoice
            __typename
        }
        channel {
            isActive
            id
            name
            currencyCode
            slug
            defaultCountry {
                code
                __typename
            }
            orderSettings {
                markAsPaidStrategy
                __typename
            }
            __typename
        }
        isPaid
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }

    fragment Address on Address {
        city
        cityArea
        companyName
        country {
            __typename
            code
            country
        }
        countryArea
        firstName
        id
        lastName
        phone
        postalCode
        streetAddress1
        streetAddress2
        __typename
    }

    fragment TransactionItem on TransactionItem {
        id
        pspReference
        actions
        name
        externalUrl
        events {
            ...TransactionEvent
            __typename
        }
        authorizedAmount {
            ...Money
            __typename
        }
        chargedAmount {
            ...Money
            __typename
        }
        refundedAmount {
            ...Money
            __typename
        }
        canceledAmount {
            ...Money
            __typename
        }
        authorizePendingAmount {
            ...Money
            __typename
        }
        chargePendingAmount {
            ...Money
            __typename
        }
        refundPendingAmount {
            ...Money
            __typename
        }
        cancelPendingAmount {
            ...Money
            __typename
        }
        __typename
    }

    fragment TransactionEvent on TransactionEvent {
        id
        pspReference
        amount {
            ...Money
            __typename
        }
        type
        message
        createdAt
        createdBy {
            ... on User {
                ...StaffMemberAvatar
                __typename
            }
            ... on App {
                ...AppAvatar
                __typename
            }
            __typename
        }
        externalUrl
        __typename
    }

    fragment Money on Money {
        amount
        currency
        __typename
    }

    fragment StaffMemberAvatar on User {
        ...StaffMember
        avatar(size: 512) {
            url
            __typename
        }
        __typename
    }

    fragment StaffMember on User {
        id
        email
        firstName
        isActive
        lastName
        __typename
    }

    fragment AppAvatar on App {
        id
        name
        __typename
    }

    fragment OrderPayment on Payment {
        id
        isActive
        actions
        gateway
        paymentMethodType
        availableCaptureAmount {
            ...Money
            __typename
        }
        capturedAmount {
            ...Money
            __typename
        }
        total {
            ...Money
            __typename
        }
        availableRefundAmount {
            ...Money
            __typename
        }
        modified
        transactions {
            id
            token
            created
            kind
            isSuccess
            __typename
        }
        __typename
    }

    fragment OrderGiftCard on GiftCard {
        id
        last4CodeChars
        events {
            id
            type
            orderId
            date
            balance {
                initialBalance {
                    ...Money
                    __typename
                }
                currentBalance {
                    ...Money
                    __typename
                }
                oldInitialBalance {
                    ...Money
                    __typename
                }
                oldCurrentBalance {
                    ...Money
                    __typename
                }
                __typename
            }
            __typename
        }
        __typename
    }

    fragment OrderGrantedRefund on OrderGrantedRefund {
        id
        createdAt
        shippingCostsIncluded
        amount {
            currency
            amount
            __typename
        }
        reason
        user {
            ...UserBaseAvatar
            __typename
        }
        app {
            id
            name
            __typename
        }
        __typename
    }

    fragment UserBaseAvatar on User {
        id
        firstName
        lastName
        email
        avatar {
            url
            alt
            __typename
        }
        __typename
    }

    fragment OrderEvent on OrderEvent {
        id
        amount
        shippingCostsIncluded
        date
        email
        emailType
        invoiceNumber
        discount {
            valueType
            value
            reason
            amount {
                amount
                currency
                __typename
            }
            oldValueType
            oldValue
            oldAmount {
                amount
                currency
                __typename
            }
            __typename
        }
        relatedOrder {
            id
            number
            __typename
        }
        message
        quantity
        transactionReference
        type
        user {
            id
            email
            firstName
            lastName
            __typename
        }
        app {
            id
            name
            appUrl
            __typename
        }
        lines {
            quantity
            itemName
            discount {
                valueType
                value
                reason
                amount {
                    amount
                    currency
                    __typename
                }
                oldValueType
                oldValue
                oldAmount {
                    amount
                    currency
                    __typename
                }
                __typename
            }
            orderLine {
                id
                productName
                variantName
                __typename
            }
            __typename
        }
        __typename
    }

    fragment Fulfillment on Fulfillment {
        ...Metadata
        id
        lines {
            id
            quantity
            orderLine {
                ...OrderLine
                __typename
            }
            __typename
        }
        fulfillmentOrder
        status
        trackingNumber
        warehouse {
            id
            name
            __typename
        }
        __typename
    }

    fragment OrderLine on OrderLine {
        id
        isShippingRequired
        allocations {
            id
            quantity
            warehouse {
                id
                name
                __typename
            }
            __typename
        }
        variant {
            id
            name
            quantityAvailable
            preorder {
                endDate
                __typename
            }
            stocks {
                ...Stock
                __typename
            }
            product {
                id
                isAvailableForPurchase
                __typename
            }
            __typename
        }
        productName
        productSku
        quantity
        quantityFulfilled
        quantityToFulfill
        totalPrice {
            ...TaxedMoney
            __typename
        }
        unitDiscount {
            amount
            currency
            __typename
        }
        unitDiscountValue
        unitDiscountReason
        unitDiscountType
        undiscountedUnitPrice {
            currency
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        unitPrice {
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        thumbnail {
            url
            __typename
        }
        __typename
    }

    fragment Stock on Stock {
        id
        quantity
        quantityAllocated
        warehouse {
            ...Warehouse
            __typename
        }
        __typename
    }

    fragment Warehouse on Warehouse {
        id
        name
        __typename
    }

    fragment TaxedMoney on TaxedMoney {
        net {
            ...Money
            __typename
        }
        gross {
            ...Money
            __typename
        }
        __typename
    }

    fragment Invoice on Invoice {
        id
        number
        createdAt
        url
        status
        __typename
    }
`;

export const UPDATE_SHIPPING = gql`
    mutation Shipping_CarrierUpdate($id: ID!, $input: Shipping_CarrierInput!) {
        shippingCarrierUpdate(id: $id, input: $input) {
            shippingCarrier {
                id
                name
                trackingUrl
            }
        }
    }
`;

export const DELETE_SHIPPING = gql`
    mutation Shipping_CarrierDelete($id: ID!) {
        shippingCarrierDelete(id: $id) {
            errors {
                message
            }
        }
    }
`;

export const REMOVE_DISCOUNT = gql`
    mutation OrderDiscountDelete($discountId: ID!) {
        orderDiscountDelete(discountId: $discountId) {
            errors {
                ...OrderError
                __typename
            }
            order {
                ...OrderDetails
                __typename
            }
            __typename
        }
    }

    fragment OrderError on OrderError {
        code
        field
        addressType
        message
        orderLines
        __typename
    }

    fragment OrderDetails on Order {
        id
        token
        ...Metadata
        billingAddress {
            ...Address
            __typename
        }
        transactions {
            ...TransactionItem
            __typename
        }
        payments {
            ...OrderPayment
            __typename
        }
        giftCards {
            ...OrderGiftCard
            __typename
        }
        grantedRefunds {
            ...OrderGrantedRefund
            __typename
        }
        isShippingRequired
        canFinalize
        created
        customerNote
        discounts {
            id
            type
            calculationMode: valueType
            value
            reason
            amount {
                ...Money
                __typename
            }
            __typename
        }
        events {
            ...OrderEvent
            __typename
        }
        fulfillments {
            ...Fulfillment
            __typename
        }
        lines {
            ...OrderLine
            __typename
        }
        number
        isPaid
        paymentStatus
        shippingAddress {
            ...Address
            __typename
        }
        deliveryMethod {
            __typename
            ... on ShippingMethod {
                id
                __typename
            }
            ... on Warehouse {
                id
                clickAndCollectOption
                __typename
            }
        }
        shippingMethod {
            id
            __typename
        }
        shippingMethodName
        collectionPointName
        shippingPrice {
            gross {
                amount
                currency
                __typename
            }
            __typename
        }
        status
        subtotal {
            gross {
                ...Money
                __typename
            }
            net {
                ...Money
                __typename
            }
            __typename
        }
        total {
            gross {
                ...Money
                __typename
            }
            net {
                ...Money
                __typename
            }
            tax {
                ...Money
                __typename
            }
            __typename
        }
        totalRemainingGrant {
            ...Money
            __typename
        }
        totalGrantedRefund {
            ...Money
            __typename
        }
        totalRefundPending {
            ...Money
            __typename
        }
        totalRefunded {
            ...Money
            __typename
        }
        actions
        totalAuthorizePending {
            ...Money
            __typename
        }
        totalAuthorized {
            ...Money
            __typename
        }
        totalCaptured {
            ...Money
            __typename
        }
        totalCharged {
            ...Money
            __typename
        }
        totalChargePending {
            ...Money
            __typename
        }
        totalCanceled {
            ...Money
            __typename
        }
        totalCancelPending {
            ...Money
            __typename
        }
        totalBalance {
            ...Money
            __typename
        }
        undiscountedTotal {
            net {
                ...Money
                __typename
            }
            gross {
                ...Money
                __typename
            }
            __typename
        }
        user {
            id
            email
            __typename
        }
        userEmail
        shippingMethods {
            id
            name
            price {
                ...Money
                __typename
            }
            active
            message
            __typename
        }
        invoices {
            ...Invoice
            __typename
        }
        channel {
            isActive
            id
            name
            currencyCode
            slug
            defaultCountry {
                code
                __typename
            }
            orderSettings {
                markAsPaidStrategy
                __typename
            }
            __typename
        }
        isPaid
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }

    fragment Address on Address {
        city
        cityArea
        companyName
        country {
            __typename
            code
            country
        }
        countryArea
        firstName
        id
        lastName
        phone
        postalCode
        streetAddress1
        streetAddress2
        __typename
    }

    fragment TransactionItem on TransactionItem {
        id
        pspReference
        actions
        name
        externalUrl
        events {
            ...TransactionEvent
            __typename
        }
        authorizedAmount {
            ...Money
            __typename
        }
        chargedAmount {
            ...Money
            __typename
        }
        refundedAmount {
            ...Money
            __typename
        }
        canceledAmount {
            ...Money
            __typename
        }
        authorizePendingAmount {
            ...Money
            __typename
        }
        chargePendingAmount {
            ...Money
            __typename
        }
        refundPendingAmount {
            ...Money
            __typename
        }
        cancelPendingAmount {
            ...Money
            __typename
        }
        __typename
    }

    fragment TransactionEvent on TransactionEvent {
        id
        pspReference
        amount {
            ...Money
            __typename
        }
        type
        message
        createdAt
        createdBy {
            ... on User {
                ...StaffMemberAvatar
                __typename
            }
            ... on App {
                ...AppAvatar
                __typename
            }
            __typename
        }
        externalUrl
        __typename
    }

    fragment Money on Money {
        amount
        currency
        __typename
    }

    fragment StaffMemberAvatar on User {
        ...StaffMember
        avatar(size: 512) {
            url
            __typename
        }
        __typename
    }

    fragment StaffMember on User {
        id
        email
        firstName
        isActive
        lastName
        __typename
    }

    fragment AppAvatar on App {
        id
        name
        __typename
    }

    fragment OrderPayment on Payment {
        id
        isActive
        actions
        gateway
        paymentMethodType
        availableCaptureAmount {
            ...Money
            __typename
        }
        capturedAmount {
            ...Money
            __typename
        }
        total {
            ...Money
            __typename
        }
        availableRefundAmount {
            ...Money
            __typename
        }
        modified
        transactions {
            id
            token
            created
            kind
            isSuccess
            __typename
        }
        __typename
    }

    fragment OrderGiftCard on GiftCard {
        id
        last4CodeChars
        events {
            id
            type
            orderId
            date
            balance {
                initialBalance {
                    ...Money
                    __typename
                }
                currentBalance {
                    ...Money
                    __typename
                }
                oldInitialBalance {
                    ...Money
                    __typename
                }
                oldCurrentBalance {
                    ...Money
                    __typename
                }
                __typename
            }
            __typename
        }
        __typename
    }

    fragment OrderGrantedRefund on OrderGrantedRefund {
        id
        createdAt
        shippingCostsIncluded
        amount {
            currency
            amount
            __typename
        }
        reason
        user {
            ...UserBaseAvatar
            __typename
        }
        app {
            id
            name
            __typename
        }
        __typename
    }

    fragment UserBaseAvatar on User {
        id
        firstName
        lastName
        email
        avatar {
            url
            alt
            __typename
        }
        __typename
    }

    fragment OrderEvent on OrderEvent {
        id
        amount
        shippingCostsIncluded
        date
        email
        emailType
        invoiceNumber
        discount {
            valueType
            value
            reason
            amount {
                amount
                currency
                __typename
            }
            oldValueType
            oldValue
            oldAmount {
                amount
                currency
                __typename
            }
            __typename
        }
        relatedOrder {
            id
            number
            __typename
        }
        message
        quantity
        transactionReference
        type
        user {
            id
            email
            firstName
            lastName
            __typename
        }
        app {
            id
            name
            appUrl
            __typename
        }
        lines {
            quantity
            itemName
            discount {
                valueType
                value
                reason
                amount {
                    amount
                    currency
                    __typename
                }
                oldValueType
                oldValue
                oldAmount {
                    amount
                    currency
                    __typename
                }
                __typename
            }
            orderLine {
                id
                productName
                variantName
                __typename
            }
            __typename
        }
        __typename
    }

    fragment Fulfillment on Fulfillment {
        ...Metadata
        id
        lines {
            id
            quantity
            orderLine {
                ...OrderLine
                __typename
            }
            __typename
        }
        fulfillmentOrder
        status
        trackingNumber
        warehouse {
            id
            name
            __typename
        }
        __typename
    }

    fragment OrderLine on OrderLine {
        id
        isShippingRequired
        allocations {
            id
            quantity
            warehouse {
                id
                name
                __typename
            }
            __typename
        }
        variant {
            id
            name
            quantityAvailable
            preorder {
                endDate
                __typename
            }
            stocks {
                ...Stock
                __typename
            }
            product {
                id
                isAvailableForPurchase
                __typename
            }
            __typename
        }
        productName
        productSku
        quantity
        quantityFulfilled
        quantityToFulfill
        totalPrice {
            ...TaxedMoney
            __typename
        }
        unitDiscount {
            amount
            currency
            __typename
        }
        unitDiscountValue
        unitDiscountReason
        unitDiscountType
        undiscountedUnitPrice {
            currency
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        unitPrice {
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        thumbnail {
            url
            __typename
        }
        __typename
    }

    fragment Stock on Stock {
        id
        quantity
        quantityAllocated
        warehouse {
            ...Warehouse
            __typename
        }
        __typename
    }

    fragment Warehouse on Warehouse {
        id
        name
        __typename
    }

    fragment TaxedMoney on TaxedMoney {
        net {
            ...Money
            __typename
        }
        gross {
            ...Money
            __typename
        }
        __typename
    }

    fragment Invoice on Invoice {
        id
        number
        createdAt
        url
        status
        __typename
    }
`;

export const FULLFILL_ORDERS = gql`
    mutation FulfillOrder($orderId: ID!, $input: OrderFulfillInput!) {
        orderFulfill(order: $orderId, input: $input) {
            errors {
                ...OrderError
                warehouse
                __typename
            }
            order {
                ...OrderDetails
                __typename
            }
            __typename
        }
    }

    fragment OrderError on OrderError {
        code
        field
        addressType
        message
        orderLines
        __typename
    }

    fragment OrderDetails on Order {
        id
        token
        ...Metadata
        billingAddress {
            ...Address
            __typename
        }
        transactions {
            ...TransactionItem
            __typename
        }
        payments {
            ...OrderPayment
            __typename
        }
        giftCards {
            ...OrderGiftCard
            __typename
        }
        grantedRefunds {
            ...OrderGrantedRefund
            __typename
        }
        isShippingRequired
        canFinalize
        created
        customerNote
        discounts {
            id
            type
            calculationMode: valueType
            value
            reason
            amount {
                ...Money
                __typename
            }
            __typename
        }
        events {
            ...OrderEvent
            __typename
        }
        fulfillments {
            ...Fulfillment
            __typename
        }
        lines {
            ...OrderLine
            __typename
        }
        number
        isPaid
        paymentStatus
        shippingAddress {
            ...Address
            __typename
        }
        deliveryMethod {
            __typename
            ... on ShippingMethod {
                id
                __typename
            }
            ... on Warehouse {
                id
                clickAndCollectOption
                __typename
            }
        }
        shippingMethod {
            id
            __typename
        }
        shippingMethodName
        collectionPointName
        shippingPrice {
            gross {
                amount
                currency
                __typename
            }
            __typename
        }
        status
        subtotal {
            gross {
                ...Money
                __typename
            }
            net {
                ...Money
                __typename
            }
            __typename
        }
        total {
            gross {
                ...Money
                __typename
            }
            net {
                ...Money
                __typename
            }
            tax {
                ...Money
                __typename
            }
            __typename
        }
        totalRemainingGrant {
            ...Money
            __typename
        }
        totalGrantedRefund {
            ...Money
            __typename
        }
        totalRefundPending {
            ...Money
            __typename
        }
        totalRefunded {
            ...Money
            __typename
        }
        actions
        totalAuthorizePending {
            ...Money
            __typename
        }
        totalAuthorized {
            ...Money
            __typename
        }
        totalCaptured {
            ...Money
            __typename
        }
        totalCharged {
            ...Money
            __typename
        }
        totalChargePending {
            ...Money
            __typename
        }
        totalCanceled {
            ...Money
            __typename
        }
        totalCancelPending {
            ...Money
            __typename
        }
        totalBalance {
            ...Money
            __typename
        }
        undiscountedTotal {
            net {
                ...Money
                __typename
            }
            gross {
                ...Money
                __typename
            }
            __typename
        }
        user {
            id
            email
            __typename
        }
        userEmail
        shippingMethods {
            id
            name
            price {
                ...Money
                __typename
            }
            active
            message
            __typename
        }
        invoices {
            ...Invoice
            __typename
        }
        channel {
            isActive
            id
            name
            currencyCode
            slug
            defaultCountry {
                code
                __typename
            }
            orderSettings {
                markAsPaidStrategy
                __typename
            }
            __typename
        }
        isPaid
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }

    fragment Address on Address {
        city
        cityArea
        companyName
        country {
            __typename
            code
            country
        }
        countryArea
        firstName
        id
        lastName
        phone
        postalCode
        streetAddress1
        streetAddress2
        __typename
    }

    fragment TransactionItem on TransactionItem {
        id
        pspReference
        actions
        name
        externalUrl
        events {
            ...TransactionEvent
            __typename
        }
        authorizedAmount {
            ...Money
            __typename
        }
        chargedAmount {
            ...Money
            __typename
        }
        refundedAmount {
            ...Money
            __typename
        }
        canceledAmount {
            ...Money
            __typename
        }
        authorizePendingAmount {
            ...Money
            __typename
        }
        chargePendingAmount {
            ...Money
            __typename
        }
        refundPendingAmount {
            ...Money
            __typename
        }
        cancelPendingAmount {
            ...Money
            __typename
        }
        __typename
    }

    fragment TransactionEvent on TransactionEvent {
        id
        pspReference
        amount {
            ...Money
            __typename
        }
        type
        message
        createdAt
        createdBy {
            ... on User {
                ...StaffMemberAvatar
                __typename
            }
            ... on App {
                ...AppAvatar
                __typename
            }
            __typename
        }
        externalUrl
        __typename
    }

    fragment Money on Money {
        amount
        currency
        __typename
    }

    fragment StaffMemberAvatar on User {
        ...StaffMember
        avatar(size: 512) {
            url
            __typename
        }
        __typename
    }

    fragment StaffMember on User {
        id
        email
        firstName
        isActive
        lastName
        __typename
    }

    fragment AppAvatar on App {
        id
        name
        __typename
    }

    fragment OrderPayment on Payment {
        id
        isActive
        actions
        gateway
        paymentMethodType
        availableCaptureAmount {
            ...Money
            __typename
        }
        capturedAmount {
            ...Money
            __typename
        }
        total {
            ...Money
            __typename
        }
        availableRefundAmount {
            ...Money
            __typename
        }
        modified
        transactions {
            id
            token
            created
            kind
            isSuccess
            __typename
        }
        __typename
    }

    fragment OrderGiftCard on GiftCard {
        id
        last4CodeChars
        events {
            id
            type
            orderId
            date
            balance {
                initialBalance {
                    ...Money
                    __typename
                }
                currentBalance {
                    ...Money
                    __typename
                }
                oldInitialBalance {
                    ...Money
                    __typename
                }
                oldCurrentBalance {
                    ...Money
                    __typename
                }
                __typename
            }
            __typename
        }
        __typename
    }

    fragment OrderGrantedRefund on OrderGrantedRefund {
        id
        createdAt
        shippingCostsIncluded
        amount {
            currency
            amount
            __typename
        }
        reason
        user {
            ...UserBaseAvatar
            __typename
        }
        app {
            id
            name
            __typename
        }
        __typename
    }

    fragment UserBaseAvatar on User {
        id
        firstName
        lastName
        email
        avatar {
            url
            alt
            __typename
        }
        __typename
    }

    fragment OrderEvent on OrderEvent {
        id
        amount
        shippingCostsIncluded
        date
        email
        emailType
        invoiceNumber
        discount {
            valueType
            value
            reason
            amount {
                amount
                currency
                __typename
            }
            oldValueType
            oldValue
            oldAmount {
                amount
                currency
                __typename
            }
            __typename
        }
        relatedOrder {
            id
            number
            __typename
        }
        message
        quantity
        transactionReference
        type
        user {
            id
            email
            firstName
            lastName
            __typename
        }
        app {
            id
            name
            appUrl
            __typename
        }
        lines {
            quantity
            itemName
            discount {
                valueType
                value
                reason
                amount {
                    amount
                    currency
                    __typename
                }
                oldValueType
                oldValue
                oldAmount {
                    amount
                    currency
                    __typename
                }
                __typename
            }
            orderLine {
                id
                productName
                variantName
                __typename
            }
            __typename
        }
        __typename
    }

    fragment Fulfillment on Fulfillment {
        ...Metadata
        id
        lines {
            id
            quantity
            orderLine {
                ...OrderLine
                __typename
            }
            __typename
        }
        fulfillmentOrder
        status
        trackingNumber
        warehouse {
            id
            name
            __typename
        }
        __typename
    }

    fragment OrderLine on OrderLine {
        id
        isShippingRequired
        allocations {
            id
            quantity
            warehouse {
                id
                name
                __typename
            }
            __typename
        }
        variant {
            id
            name
            quantityAvailable
            preorder {
                endDate
                __typename
            }
            stocks {
                ...Stock
                __typename
            }
            product {
                id
                isAvailableForPurchase
                __typename
            }
            __typename
        }
        productName
        productSku
        quantity
        quantityFulfilled
        quantityToFulfill
        totalPrice {
            ...TaxedMoney
            __typename
        }
        unitDiscount {
            amount
            currency
            __typename
        }
        unitDiscountValue
        unitDiscountReason
        unitDiscountType
        undiscountedUnitPrice {
            currency
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        unitPrice {
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        thumbnail {
            url
            __typename
        }
        __typename
    }

    fragment Stock on Stock {
        id
        quantity
        quantityAllocated
        warehouse {
            ...Warehouse
            __typename
        }
        __typename
    }

    fragment Warehouse on Warehouse {
        id
        name
        __typename
    }

    fragment TaxedMoney on TaxedMoney {
        net {
            ...Money
            __typename
        }
        gross {
            ...Money
            __typename
        }
        __typename
    }

    fragment Invoice on Invoice {
        id
        number
        createdAt
        url
        status
        __typename
    }
`;

export const MARK_US_PAID = gql`
    mutation OrderMarkAsPaid($id: ID!, $transactionReference: String) {
        orderMarkAsPaid(id: $id, transactionReference: $transactionReference) {
            errors {
                ...OrderError
                __typename
            }
            order {
                ...OrderDetails
                __typename
            }
            __typename
        }
    }

    fragment OrderError on OrderError {
        code
        field
        addressType
        message
        orderLines
        __typename
    }

    fragment OrderDetails on Order {
        id
        token
        ...Metadata
        billingAddress {
            ...Address
            __typename
        }
        transactions {
            ...TransactionItem
            __typename
        }
        payments {
            ...OrderPayment
            __typename
        }
        giftCards {
            ...OrderGiftCard
            __typename
        }
        grantedRefunds {
            ...OrderGrantedRefund
            __typename
        }
        isShippingRequired
        canFinalize
        created
        customerNote
        discounts {
            id
            type
            calculationMode: valueType
            value
            reason
            amount {
                ...Money
                __typename
            }
            __typename
        }
        events {
            ...OrderEvent
            __typename
        }
        fulfillments {
            ...Fulfillment
            __typename
        }
        lines {
            ...OrderLine
            __typename
        }
        number
        isPaid
        paymentStatus
        shippingAddress {
            ...Address
            __typename
        }
        deliveryMethod {
            __typename
            ... on ShippingMethod {
                id
                __typename
            }
            ... on Warehouse {
                id
                clickAndCollectOption
                __typename
            }
        }
        shippingMethod {
            id
            __typename
        }
        shippingMethodName
        collectionPointName
        shippingPrice {
            gross {
                amount
                currency
                __typename
            }
            __typename
        }
        status
        subtotal {
            gross {
                ...Money
                __typename
            }
            net {
                ...Money
                __typename
            }
            __typename
        }
        total {
            gross {
                ...Money
                __typename
            }
            net {
                ...Money
                __typename
            }
            tax {
                ...Money
                __typename
            }
            __typename
        }
        totalRemainingGrant {
            ...Money
            __typename
        }
        totalGrantedRefund {
            ...Money
            __typename
        }
        totalRefundPending {
            ...Money
            __typename
        }
        totalRefunded {
            ...Money
            __typename
        }
        actions
        totalAuthorizePending {
            ...Money
            __typename
        }
        totalAuthorized {
            ...Money
            __typename
        }
        totalCaptured {
            ...Money
            __typename
        }
        totalCharged {
            ...Money
            __typename
        }
        totalChargePending {
            ...Money
            __typename
        }
        totalCanceled {
            ...Money
            __typename
        }
        totalCancelPending {
            ...Money
            __typename
        }
        totalBalance {
            ...Money
            __typename
        }
        undiscountedTotal {
            net {
                ...Money
                __typename
            }
            gross {
                ...Money
                __typename
            }
            __typename
        }
        user {
            id
            email
            __typename
        }
        userEmail
        shippingMethods {
            id
            name
            price {
                ...Money
                __typename
            }
            active
            message
            __typename
        }
        invoices {
            ...Invoice
            __typename
        }
        channel {
            isActive
            id
            name
            currencyCode
            slug
            defaultCountry {
                code
                __typename
            }
            orderSettings {
                markAsPaidStrategy
                __typename
            }
            __typename
        }
        isPaid
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }

    fragment Address on Address {
        city
        cityArea
        companyName
        country {
            __typename
            code
            country
        }
        countryArea
        firstName
        id
        lastName
        phone
        postalCode
        streetAddress1
        streetAddress2
        __typename
    }

    fragment TransactionItem on TransactionItem {
        id
        pspReference
        actions
        name
        externalUrl
        events {
            ...TransactionEvent
            __typename
        }
        authorizedAmount {
            ...Money
            __typename
        }
        chargedAmount {
            ...Money
            __typename
        }
        refundedAmount {
            ...Money
            __typename
        }
        canceledAmount {
            ...Money
            __typename
        }
        authorizePendingAmount {
            ...Money
            __typename
        }
        chargePendingAmount {
            ...Money
            __typename
        }
        refundPendingAmount {
            ...Money
            __typename
        }
        cancelPendingAmount {
            ...Money
            __typename
        }
        __typename
    }

    fragment TransactionEvent on TransactionEvent {
        id
        pspReference
        amount {
            ...Money
            __typename
        }
        type
        message
        createdAt
        createdBy {
            ... on User {
                ...StaffMemberAvatar
                __typename
            }
            ... on App {
                ...AppAvatar
                __typename
            }
            __typename
        }
        externalUrl
        __typename
    }

    fragment Money on Money {
        amount
        currency
        __typename
    }

    fragment StaffMemberAvatar on User {
        ...StaffMember
        avatar(size: 512) {
            url
            __typename
        }
        __typename
    }

    fragment StaffMember on User {
        id
        email
        firstName
        isActive
        lastName
        __typename
    }

    fragment AppAvatar on App {
        id
        name
        __typename
    }

    fragment OrderPayment on Payment {
        id
        isActive
        actions
        gateway
        paymentMethodType
        availableCaptureAmount {
            ...Money
            __typename
        }
        capturedAmount {
            ...Money
            __typename
        }
        total {
            ...Money
            __typename
        }
        availableRefundAmount {
            ...Money
            __typename
        }
        modified
        transactions {
            id
            token
            created
            kind
            isSuccess
            __typename
        }
        __typename
    }

    fragment OrderGiftCard on GiftCard {
        id
        last4CodeChars
        events {
            id
            type
            orderId
            date
            balance {
                initialBalance {
                    ...Money
                    __typename
                }
                currentBalance {
                    ...Money
                    __typename
                }
                oldInitialBalance {
                    ...Money
                    __typename
                }
                oldCurrentBalance {
                    ...Money
                    __typename
                }
                __typename
            }
            __typename
        }
        __typename
    }

    fragment OrderGrantedRefund on OrderGrantedRefund {
        id
        createdAt
        shippingCostsIncluded
        amount {
            currency
            amount
            __typename
        }
        reason
        user {
            ...UserBaseAvatar
            __typename
        }
        app {
            id
            name
            __typename
        }
        __typename
    }

    fragment UserBaseAvatar on User {
        id
        firstName
        lastName
        email
        avatar {
            url
            alt
            __typename
        }
        __typename
    }

    fragment OrderEvent on OrderEvent {
        id
        amount
        shippingCostsIncluded
        date
        email
        emailType
        invoiceNumber
        discount {
            valueType
            value
            reason
            amount {
                amount
                currency
                __typename
            }
            oldValueType
            oldValue
            oldAmount {
                amount
                currency
                __typename
            }
            __typename
        }
        relatedOrder {
            id
            number
            __typename
        }
        message
        quantity
        transactionReference
        type
        user {
            id
            email
            firstName
            lastName
            __typename
        }
        app {
            id
            name
            appUrl
            __typename
        }
        lines {
            quantity
            itemName
            discount {
                valueType
                value
                reason
                amount {
                    amount
                    currency
                    __typename
                }
                oldValueType
                oldValue
                oldAmount {
                    amount
                    currency
                    __typename
                }
                __typename
            }
            orderLine {
                id
                productName
                variantName
                __typename
            }
            __typename
        }
        __typename
    }

    fragment Fulfillment on Fulfillment {
        ...Metadata
        id
        lines {
            id
            quantity
            orderLine {
                ...OrderLine
                __typename
            }
            __typename
        }
        fulfillmentOrder
        status
        trackingNumber
        warehouse {
            id
            name
            __typename
        }
        __typename
    }

    fragment OrderLine on OrderLine {
        id
        isShippingRequired
        allocations {
            id
            quantity
            warehouse {
                id
                name
                __typename
            }
            __typename
        }
        variant {
            id
            name
            quantityAvailable
            preorder {
                endDate
                __typename
            }
            stocks {
                ...Stock
                __typename
            }
            product {
                id
                isAvailableForPurchase
                __typename
            }
            __typename
        }
        productName
        productSku
        quantity
        quantityFulfilled
        quantityToFulfill
        totalPrice {
            ...TaxedMoney
            __typename
        }
        unitDiscount {
            amount
            currency
            __typename
        }
        unitDiscountValue
        unitDiscountReason
        unitDiscountType
        undiscountedUnitPrice {
            currency
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        unitPrice {
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        thumbnail {
            url
            __typename
        }
        __typename
    }

    fragment Stock on Stock {
        id
        quantity
        quantityAllocated
        warehouse {
            ...Warehouse
            __typename
        }
        __typename
    }

    fragment Warehouse on Warehouse {
        id
        name
        __typename
    }

    fragment TaxedMoney on TaxedMoney {
        net {
            ...Money
            __typename
        }
        gross {
            ...Money
            __typename
        }
        __typename
    }

    fragment Invoice on Invoice {
        id
        number
        createdAt
        url
        status
        __typename
    }
`;

export const UPDATE_COUPEN = gql`
    mutation OrderDiscountUpdate($input: OrderDiscountCommonInput!, $discountId: ID!) {
        orderDiscountUpdate(input: $input, discountId: $discountId) {
            errors {
                ...OrderError
                __typename
            }
            order {
                ...OrderDetails
                __typename
            }
            __typename
        }
    }

    fragment OrderError on OrderError {
        code
        field
        addressType
        message
        orderLines
        __typename
    }

    fragment OrderDetails on Order {
        id
        token
        ...Metadata
        billingAddress {
            ...Address
            __typename
        }
        transactions {
            ...TransactionItem
            __typename
        }
        payments {
            ...OrderPayment
            __typename
        }
        giftCards {
            ...OrderGiftCard
            __typename
        }
        grantedRefunds {
            ...OrderGrantedRefund
            __typename
        }
        isShippingRequired
        canFinalize
        created
        customerNote
        discounts {
            id
            type
            calculationMode: valueType
            value
            reason
            amount {
                ...Money
                __typename
            }
            __typename
        }
        events {
            ...OrderEvent
            __typename
        }
        fulfillments {
            ...Fulfillment
            __typename
        }
        lines {
            ...OrderLine
            __typename
        }
        number
        isPaid
        paymentStatus
        shippingAddress {
            ...Address
            __typename
        }
        deliveryMethod {
            __typename
            ... on ShippingMethod {
                id
                __typename
            }
            ... on Warehouse {
                id
                clickAndCollectOption
                __typename
            }
        }
        shippingMethod {
            id
            __typename
        }
        shippingMethodName
        collectionPointName
        shippingPrice {
            gross {
                amount
                currency
                __typename
            }
            __typename
        }
        status
        subtotal {
            gross {
                ...Money
                __typename
            }
            net {
                ...Money
                __typename
            }
            __typename
        }
        total {
            gross {
                ...Money
                __typename
            }
            net {
                ...Money
                __typename
            }
            tax {
                ...Money
                __typename
            }
            __typename
        }
        totalRemainingGrant {
            ...Money
            __typename
        }
        totalGrantedRefund {
            ...Money
            __typename
        }
        totalRefundPending {
            ...Money
            __typename
        }
        totalRefunded {
            ...Money
            __typename
        }
        actions
        totalAuthorizePending {
            ...Money
            __typename
        }
        totalAuthorized {
            ...Money
            __typename
        }
        totalCaptured {
            ...Money
            __typename
        }
        totalCharged {
            ...Money
            __typename
        }
        totalChargePending {
            ...Money
            __typename
        }
        totalCanceled {
            ...Money
            __typename
        }
        totalCancelPending {
            ...Money
            __typename
        }
        totalBalance {
            ...Money
            __typename
        }
        undiscountedTotal {
            net {
                ...Money
                __typename
            }
            gross {
                ...Money
                __typename
            }
            __typename
        }
        user {
            id
            email
            __typename
        }
        userEmail
        shippingMethods {
            id
            name
            price {
                ...Money
                __typename
            }
            active
            message
            __typename
        }
        invoices {
            ...Invoice
            __typename
        }
        channel {
            isActive
            id
            name
            currencyCode
            slug
            defaultCountry {
                code
                __typename
            }
            orderSettings {
                markAsPaidStrategy
                __typename
            }
            __typename
        }
        isPaid
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }

    fragment Address on Address {
        city
        cityArea
        companyName
        country {
            __typename
            code
            country
        }
        countryArea
        firstName
        id
        lastName
        phone
        postalCode
        streetAddress1
        streetAddress2
        __typename
    }

    fragment TransactionItem on TransactionItem {
        id
        pspReference
        actions
        name
        externalUrl
        events {
            ...TransactionEvent
            __typename
        }
        authorizedAmount {
            ...Money
            __typename
        }
        chargedAmount {
            ...Money
            __typename
        }
        refundedAmount {
            ...Money
            __typename
        }
        canceledAmount {
            ...Money
            __typename
        }
        authorizePendingAmount {
            ...Money
            __typename
        }
        chargePendingAmount {
            ...Money
            __typename
        }
        refundPendingAmount {
            ...Money
            __typename
        }
        cancelPendingAmount {
            ...Money
            __typename
        }
        __typename
    }

    fragment TransactionEvent on TransactionEvent {
        id
        pspReference
        amount {
            ...Money
            __typename
        }
        type
        message
        createdAt
        createdBy {
            ... on User {
                ...StaffMemberAvatar
                __typename
            }
            ... on App {
                ...AppAvatar
                __typename
            }
            __typename
        }
        externalUrl
        __typename
    }

    fragment Money on Money {
        amount
        currency
        __typename
    }

    fragment StaffMemberAvatar on User {
        ...StaffMember
        avatar(size: 512) {
            url
            __typename
        }
        __typename
    }

    fragment StaffMember on User {
        id
        email
        firstName
        isActive
        lastName
        __typename
    }

    fragment AppAvatar on App {
        id
        name
        __typename
    }

    fragment OrderPayment on Payment {
        id
        isActive
        actions
        gateway
        paymentMethodType
        availableCaptureAmount {
            ...Money
            __typename
        }
        capturedAmount {
            ...Money
            __typename
        }
        total {
            ...Money
            __typename
        }
        availableRefundAmount {
            ...Money
            __typename
        }
        modified
        transactions {
            id
            token
            created
            kind
            isSuccess
            __typename
        }
        __typename
    }

    fragment OrderGiftCard on GiftCard {
        id
        last4CodeChars
        events {
            id
            type
            orderId
            date
            balance {
                initialBalance {
                    ...Money
                    __typename
                }
                currentBalance {
                    ...Money
                    __typename
                }
                oldInitialBalance {
                    ...Money
                    __typename
                }
                oldCurrentBalance {
                    ...Money
                    __typename
                }
                __typename
            }
            __typename
        }
        __typename
    }

    fragment OrderGrantedRefund on OrderGrantedRefund {
        id
        createdAt
        shippingCostsIncluded
        amount {
            currency
            amount
            __typename
        }
        reason
        user {
            ...UserBaseAvatar
            __typename
        }
        app {
            id
            name
            __typename
        }
        __typename
    }

    fragment UserBaseAvatar on User {
        id
        firstName
        lastName
        email
        avatar {
            url
            alt
            __typename
        }
        __typename
    }

    fragment OrderEvent on OrderEvent {
        id
        amount
        shippingCostsIncluded
        date
        email
        emailType
        invoiceNumber
        discount {
            valueType
            value
            reason
            amount {
                amount
                currency
                __typename
            }
            oldValueType
            oldValue
            oldAmount {
                amount
                currency
                __typename
            }
            __typename
        }
        relatedOrder {
            id
            number
            __typename
        }
        message
        quantity
        transactionReference
        type
        user {
            id
            email
            firstName
            lastName
            __typename
        }
        app {
            id
            name
            appUrl
            __typename
        }
        lines {
            quantity
            itemName
            discount {
                valueType
                value
                reason
                amount {
                    amount
                    currency
                    __typename
                }
                oldValueType
                oldValue
                oldAmount {
                    amount
                    currency
                    __typename
                }
                __typename
            }
            orderLine {
                id
                productName
                variantName
                __typename
            }
            __typename
        }
        __typename
    }

    fragment Fulfillment on Fulfillment {
        ...Metadata
        id
        lines {
            id
            quantity
            orderLine {
                ...OrderLine
                __typename
            }
            __typename
        }
        fulfillmentOrder
        status
        trackingNumber
        warehouse {
            id
            name
            __typename
        }
        __typename
    }

    fragment OrderLine on OrderLine {
        id
        isShippingRequired
        allocations {
            id
            quantity
            warehouse {
                id
                name
                __typename
            }
            __typename
        }
        variant {
            id
            name
            quantityAvailable
            preorder {
                endDate
                __typename
            }
            stocks {
                ...Stock
                __typename
            }
            product {
                id
                isAvailableForPurchase
                __typename
            }
            __typename
        }
        productName
        productSku
        quantity
        quantityFulfilled
        quantityToFulfill
        totalPrice {
            ...TaxedMoney
            __typename
        }
        unitDiscount {
            amount
            currency
            __typename
        }
        unitDiscountValue
        unitDiscountReason
        unitDiscountType
        undiscountedUnitPrice {
            currency
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        unitPrice {
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        thumbnail {
            url
            __typename
        }
        __typename
    }

    fragment Stock on Stock {
        id
        quantity
        quantityAllocated
        warehouse {
            ...Warehouse
            __typename
        }
        __typename
    }

    fragment Warehouse on Warehouse {
        id
        name
        __typename
    }

    fragment TaxedMoney on TaxedMoney {
        net {
            ...Money
            __typename
        }
        gross {
            ...Money
            __typename
        }
        __typename
    }

    fragment Invoice on Invoice {
        id
        number
        createdAt
        url
        status
        __typename
    }
`;

export const ADD_COUPEN = gql`
    mutation OrderDiscountAdd($input: OrderDiscountCommonInput!, $orderId: ID!) {
        orderDiscountAdd(input: $input, orderId: $orderId) {
            errors {
                ...OrderError
                __typename
            }
            order {
                ...OrderDetails
                __typename
            }
            __typename
        }
    }

    fragment OrderError on OrderError {
        code
        field
        addressType
        message
        orderLines
        __typename
    }

    fragment OrderDetails on Order {
        id
        token
        ...Metadata
        billingAddress {
            ...Address
            __typename
        }
        transactions {
            ...TransactionItem
            __typename
        }
        payments {
            ...OrderPayment
            __typename
        }
        giftCards {
            ...OrderGiftCard
            __typename
        }
        grantedRefunds {
            ...OrderGrantedRefund
            __typename
        }
        isShippingRequired
        canFinalize
        created
        customerNote
        discounts {
            id
            type
            calculationMode: valueType
            value
            reason
            amount {
                ...Money
                __typename
            }
            __typename
        }
        events {
            ...OrderEvent
            __typename
        }
        fulfillments {
            ...Fulfillment
            __typename
        }
        lines {
            ...OrderLine
            __typename
        }
        number
        isPaid
        paymentStatus
        shippingAddress {
            ...Address
            __typename
        }
        deliveryMethod {
            __typename
            ... on ShippingMethod {
                id
                __typename
            }
            ... on Warehouse {
                id
                clickAndCollectOption
                __typename
            }
        }
        shippingMethod {
            id
            __typename
        }
        shippingMethodName
        collectionPointName
        shippingPrice {
            gross {
                amount
                currency
                __typename
            }
            __typename
        }
        status
        subtotal {
            gross {
                ...Money
                __typename
            }
            net {
                ...Money
                __typename
            }
            __typename
        }
        total {
            gross {
                ...Money
                __typename
            }
            net {
                ...Money
                __typename
            }
            tax {
                ...Money
                __typename
            }
            __typename
        }
        totalRemainingGrant {
            ...Money
            __typename
        }
        totalGrantedRefund {
            ...Money
            __typename
        }
        totalRefundPending {
            ...Money
            __typename
        }
        totalRefunded {
            ...Money
            __typename
        }
        actions
        totalAuthorizePending {
            ...Money
            __typename
        }
        totalAuthorized {
            ...Money
            __typename
        }
        totalCaptured {
            ...Money
            __typename
        }
        totalCharged {
            ...Money
            __typename
        }
        totalChargePending {
            ...Money
            __typename
        }
        totalCanceled {
            ...Money
            __typename
        }
        totalCancelPending {
            ...Money
            __typename
        }
        totalBalance {
            ...Money
            __typename
        }
        undiscountedTotal {
            net {
                ...Money
                __typename
            }
            gross {
                ...Money
                __typename
            }
            __typename
        }
        user {
            id
            email
            __typename
        }
        userEmail
        shippingMethods {
            id
            name
            price {
                ...Money
                __typename
            }
            active
            message
            __typename
        }
        invoices {
            ...Invoice
            __typename
        }
        channel {
            isActive
            id
            name
            currencyCode
            slug
            defaultCountry {
                code
                __typename
            }
            orderSettings {
                markAsPaidStrategy
                __typename
            }
            __typename
        }
        isPaid
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }

    fragment Address on Address {
        city
        cityArea
        companyName
        country {
            __typename
            code
            country
        }
        countryArea
        firstName
        id
        lastName
        phone
        postalCode
        streetAddress1
        streetAddress2
        __typename
    }

    fragment TransactionItem on TransactionItem {
        id
        pspReference
        actions
        name
        externalUrl
        events {
            ...TransactionEvent
            __typename
        }
        authorizedAmount {
            ...Money
            __typename
        }
        chargedAmount {
            ...Money
            __typename
        }
        refundedAmount {
            ...Money
            __typename
        }
        canceledAmount {
            ...Money
            __typename
        }
        authorizePendingAmount {
            ...Money
            __typename
        }
        chargePendingAmount {
            ...Money
            __typename
        }
        refundPendingAmount {
            ...Money
            __typename
        }
        cancelPendingAmount {
            ...Money
            __typename
        }
        __typename
    }

    fragment TransactionEvent on TransactionEvent {
        id
        pspReference
        amount {
            ...Money
            __typename
        }
        type
        message
        createdAt
        createdBy {
            ... on User {
                ...StaffMemberAvatar
                __typename
            }
            ... on App {
                ...AppAvatar
                __typename
            }
            __typename
        }
        externalUrl
        __typename
    }

    fragment Money on Money {
        amount
        currency
        __typename
    }

    fragment StaffMemberAvatar on User {
        ...StaffMember
        avatar(size: 512) {
            url
            __typename
        }
        __typename
    }

    fragment StaffMember on User {
        id
        email
        firstName
        isActive
        lastName
        __typename
    }

    fragment AppAvatar on App {
        id
        name
        __typename
    }

    fragment OrderPayment on Payment {
        id
        isActive
        actions
        gateway
        paymentMethodType
        availableCaptureAmount {
            ...Money
            __typename
        }
        capturedAmount {
            ...Money
            __typename
        }
        total {
            ...Money
            __typename
        }
        availableRefundAmount {
            ...Money
            __typename
        }
        modified
        transactions {
            id
            token
            created
            kind
            isSuccess
            __typename
        }
        __typename
    }

    fragment OrderGiftCard on GiftCard {
        id
        last4CodeChars
        events {
            id
            type
            orderId
            date
            balance {
                initialBalance {
                    ...Money
                    __typename
                }
                currentBalance {
                    ...Money
                    __typename
                }
                oldInitialBalance {
                    ...Money
                    __typename
                }
                oldCurrentBalance {
                    ...Money
                    __typename
                }
                __typename
            }
            __typename
        }
        __typename
    }

    fragment OrderGrantedRefund on OrderGrantedRefund {
        id
        createdAt
        shippingCostsIncluded
        amount {
            currency
            amount
            __typename
        }
        reason
        user {
            ...UserBaseAvatar
            __typename
        }
        app {
            id
            name
            __typename
        }
        __typename
    }

    fragment UserBaseAvatar on User {
        id
        firstName
        lastName
        email
        avatar {
            url
            alt
            __typename
        }
        __typename
    }

    fragment OrderEvent on OrderEvent {
        id
        amount
        shippingCostsIncluded
        date
        email
        emailType
        invoiceNumber
        discount {
            valueType
            value
            reason
            amount {
                amount
                currency
                __typename
            }
            oldValueType
            oldValue
            oldAmount {
                amount
                currency
                __typename
            }
            __typename
        }
        relatedOrder {
            id
            number
            __typename
        }
        message
        quantity
        transactionReference
        type
        user {
            id
            email
            firstName
            lastName
            __typename
        }
        app {
            id
            name
            appUrl
            __typename
        }
        lines {
            quantity
            itemName
            discount {
                valueType
                value
                reason
                amount {
                    amount
                    currency
                    __typename
                }
                oldValueType
                oldValue
                oldAmount {
                    amount
                    currency
                    __typename
                }
                __typename
            }
            orderLine {
                id
                productName
                variantName
                __typename
            }
            __typename
        }
        __typename
    }

    fragment Fulfillment on Fulfillment {
        ...Metadata
        id
        lines {
            id
            quantity
            orderLine {
                ...OrderLine
                __typename
            }
            __typename
        }
        fulfillmentOrder
        status
        trackingNumber
        warehouse {
            id
            name
            __typename
        }
        __typename
    }

    fragment OrderLine on OrderLine {
        id
        isShippingRequired
        allocations {
            id
            quantity
            warehouse {
                id
                name
                __typename
            }
            __typename
        }
        variant {
            id
            name
            quantityAvailable
            preorder {
                endDate
                __typename
            }
            stocks {
                ...Stock
                __typename
            }
            product {
                id
                isAvailableForPurchase
                __typename
            }
            __typename
        }
        productName
        productSku
        quantity
        quantityFulfilled
        quantityToFulfill
        totalPrice {
            ...TaxedMoney
            __typename
        }
        unitDiscount {
            amount
            currency
            __typename
        }
        unitDiscountValue
        unitDiscountReason
        unitDiscountType
        undiscountedUnitPrice {
            currency
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        unitPrice {
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        thumbnail {
            url
            __typename
        }
        __typename
    }

    fragment Stock on Stock {
        id
        quantity
        quantityAllocated
        warehouse {
            ...Warehouse
            __typename
        }
        __typename
    }

    fragment Warehouse on Warehouse {
        id
        name
        __typename
    }

    fragment TaxedMoney on TaxedMoney {
        net {
            ...Money
            __typename
        }
        gross {
            ...Money
            __typename
        }
        __typename
    }

    fragment Invoice on Invoice {
        id
        number
        createdAt
        url
        status
        __typename
    }
`;

export const GET_ORDER_DETAILS = gql`
    query OrderDetailsWithMetadata($id: ID!, $isStaffUser: Boolean!) {
        order(id: $id) {
            metadata {
                key
                value
                __typename
            }
            giftCardsPurchased {
                code
                id
                createdByEmail
                lastUsedOn
                usedByEmail
                expiryDate
                currentBalance {
                    amount
                    currency
                }
            }
            ...OrderDetailsWithMetadata
            __typename
            courierPartner {
                id
                name
                trackingUrl
                __typename
            }
            paymentMethod {
                name
                id
                __typename
            }
        }
        shop {
            countries {
                code
                country
                __typename
            }
            defaultWeightUnit
            fulfillmentAllowUnpaid
            fulfillmentAutoApprove
            availablePaymentGateways {
                ...PaymentGateway
                __typename
            }
            __typename
        }
    }

    fragment OrderDetailsWithMetadata on Order {
        ...OrderDetails
        fulfillments {
            ...FulfillmentWithMetadata
            __typename
        }
        lines {
            ...OrderLineWithMetadata
            __typename
        }
        __typename
        isGiftWrap
    }

    fragment OrderDetails on Order {
        id
        token
        codAmount
        giftWrapAmount
        ...Metadata
        billingAddress {
            ...Address
            __typename
        }
        transactions {
            ...TransactionItem
            __typename
        }
        payments {
            ...OrderPayment
            __typename
        }
        giftCards {
            ...OrderGiftCard
            __typename
        }
        grantedRefunds {
            ...OrderGrantedRefund
            __typename
        }
        isShippingRequired
        canFinalize
        created
        customerNote
        discounts {
            id
            type
            calculationMode: valueType
            value
            reason
            amount {
                ...Money
                __typename
            }
            __typename
        }
        events {
            ...OrderEvent
            __typename
        }
        fulfillments {
            ...Fulfillment
            __typename
        }
        lines {
            ...OrderLine
            __typename
        }
        number
        isPaid
        paymentStatus
        shippingAddress {
            ...Address
            __typename
        }
        deliveryMethod {
            __typename
            ... on ShippingMethod {
                id
                __typename
            }
            ... on Warehouse {
                id
                clickAndCollectOption
                __typename
            }
        }
        shippingMethod {
            id
            __typename
        }
        shippingMethodName
        collectionPointName
        shippingPrice {
            gross {
                amount
                currency
                __typename
            }
            __typename
        }
        status
        subtotal {
            gross {
                ...Money
                __typename
            }
            net {
                ...Money
                __typename
            }
            tax {
                ...Money
                __typename
            }
            __typename
        }
        total {
            gross {
                ...Money
                __typename
            }
            net {
                ...Money
                __typename
            }
            tax {
                ...Money
                __typename
            }
            __typename
        }
        totalRemainingGrant {
            ...Money
            __typename
        }
        totalGrantedRefund {
            ...Money
            __typename
        }
        totalRefundPending {
            ...Money
            __typename
        }
        totalRefunded {
            ...Money
            __typename
        }
        actions
        totalAuthorizePending {
            ...Money
            __typename
        }
        totalAuthorized {
            ...Money
            __typename
        }
        totalCaptured {
            ...Money
            __typename
        }
        totalCharged {
            ...Money
            __typename
        }
        totalChargePending {
            ...Money
            __typename
        }
        totalCanceled {
            ...Money
            __typename
        }
        totalCancelPending {
            ...Money
            __typename
        }
        totalBalance {
            ...Money
            __typename
        }
        undiscountedTotal {
            net {
                ...Money
                __typename
            }
            gross {
                ...Money
                __typename
            }
            __typename
        }
        user {
            id
            email
            __typename
        }
        userEmail
        shippingMethods {
            id
            name
            price {
                ...Money
                __typename
            }
            active
            message
            __typename
        }
        invoices {
            ...Invoice
            __typename
        }
        channel {
            isActive
            id
            name
            currencyCode
            slug
            defaultCountry {
                code
                __typename
            }
            orderSettings {
                markAsPaidStrategy
                __typename
            }
            __typename
        }
        isPaid
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }

    fragment Address on Address {
        city
        cityArea
        companyName
        country {
            __typename
            code
            country
        }
        countryArea
        firstName
        id
        lastName
        phone
        postalCode
        streetAddress1
        streetAddress2
        __typename
    }

    fragment TransactionItem on TransactionItem {
        id
        pspReference
        actions
        name
        externalUrl
        events {
            ...TransactionEvent
            __typename
        }
        authorizedAmount {
            ...Money
            __typename
        }
        chargedAmount {
            ...Money
            __typename
        }
        refundedAmount {
            ...Money
            __typename
        }
        canceledAmount {
            ...Money
            __typename
        }
        authorizePendingAmount {
            ...Money
            __typename
        }
        chargePendingAmount {
            ...Money
            __typename
        }
        refundPendingAmount {
            ...Money
            __typename
        }
        cancelPendingAmount {
            ...Money
            __typename
        }
        __typename
    }

    fragment TransactionEvent on TransactionEvent {
        id
        pspReference
        amount {
            ...Money
            __typename
        }
        type
        message
        createdAt
        createdBy {
            ... on User {
                ...StaffMemberAvatar
                __typename
            }
            ... on App {
                ...AppAvatar
                __typename
            }
            __typename
        }
        externalUrl
        __typename
    }

    fragment Money on Money {
        amount
        currency
        __typename
    }

    fragment StaffMemberAvatar on User {
        ...StaffMember
        avatar(size: 512) {
            url
            __typename
        }
        __typename
    }

    fragment StaffMember on User {
        id
        email
        firstName
        isActive
        lastName
        __typename
    }

    fragment AppAvatar on App {
        id
        name
        __typename
    }

    fragment OrderPayment on Payment {
        id
        isActive
        actions
        gateway
        paymentMethodType
        availableCaptureAmount {
            ...Money
            __typename
        }
        capturedAmount {
            ...Money
            __typename
        }
        total {
            ...Money
            __typename
        }
        availableRefundAmount {
            ...Money
            __typename
        }
        modified
        transactions {
            id
            token
            created
            kind
            isSuccess
            __typename
        }
        __typename
    }

    fragment OrderGiftCard on GiftCard {
        id
        last4CodeChars
        events {
            id
            type
            orderId
            date
            balance {
                initialBalance {
                    ...Money
                    __typename
                }
                currentBalance {
                    ...Money
                    __typename
                }
                oldInitialBalance {
                    ...Money
                    __typename
                }
                oldCurrentBalance {
                    ...Money
                    __typename
                }
                __typename
            }
            __typename
        }
        __typename
    }

    fragment OrderGrantedRefund on OrderGrantedRefund {
        id
        createdAt
        shippingCostsIncluded
        amount {
            currency
            amount
            __typename
        }
        reason
        user {
            ...UserBaseAvatar
            __typename
        }
        app {
            id
            name
            __typename
        }
        __typename
    }

    fragment UserBaseAvatar on User {
        id
        firstName
        lastName
        email
        avatar {
            url
            alt
            __typename
        }
        __typename
    }

    fragment OrderEvent on OrderEvent {
        id
        amount
        shippingCostsIncluded
        date
        email
        emailType
        invoiceNumber
        discount {
            valueType
            value
            reason
            amount {
                amount
                currency
                __typename
            }
            oldValueType
            oldValue
            oldAmount {
                amount
                currency
                __typename
            }
            __typename
        }
        relatedOrder {
            id
            number
            __typename
        }
        message
        quantity
        transactionReference
        type
        user {
            id
            email
            firstName
            lastName
            __typename
        }
        app {
            id
            name
            appUrl
            __typename
        }
        lines {
            quantity
            itemName
            discount {
                valueType
                value
                reason
                amount {
                    amount
                    currency
                    __typename
                }
                oldValueType
                oldValue
                oldAmount {
                    amount
                    currency
                    __typename
                }
                __typename
            }
            orderLine {
                id
                productName
                variantName
                __typename
            }
            __typename
        }
        __typename
    }

    fragment Fulfillment on Fulfillment {
        ...Metadata
        id
        lines {
            id
            quantity
            orderLine {
                ...OrderLine
                __typename
            }
            __typename
        }
        fulfillmentOrder
        status
        trackingNumber
        warehouse {
            id
            name
            __typename
        }
        __typename
    }

    fragment OrderLine on OrderLine {
        id
        isShippingRequired
        allocations {
            id
            quantity
            warehouse {
                id
                name
                __typename
            }
            __typename
        }
        variant {
            id
            name
            quantityAvailable
            preorder {
                endDate
                __typename
            }
            stocks {
                ...Stock
                __typename
            }
            product {
                id
                isAvailableForPurchase
                __typename
                thumbnail {
                    url
                }
            }
            __typename
        }
        productName
        productSku
        quantity
        quantityFulfilled
        quantityToFulfill
        totalPrice {
            ...TaxedMoney
            __typename
        }
        unitDiscount {
            amount
            currency
            __typename
        }
        unitDiscountValue
        unitDiscountReason
        unitDiscountType
        undiscountedUnitPrice {
            currency
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        unitPrice {
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            tax {
                amount
                currency
                __typename
            }
            __typename
        }
        thumbnail {
            url
            __typename
        }
        __typename
    }

    fragment Stock on Stock {
        id
        quantity
        quantityAllocated
        warehouse {
            ...Warehouse
            __typename
        }
        __typename
    }

    fragment Warehouse on Warehouse {
        id
        name
        __typename
    }

    fragment TaxedMoney on TaxedMoney {
        net {
            ...Money
            __typename
        }
        gross {
            ...Money
            __typename
        }
        tax {
            ...Money
            __typename
        }
        __typename
    }

    fragment Invoice on Invoice {
        id
        number
        createdAt
        url
        status
        __typename
    }

    fragment FulfillmentWithMetadata on Fulfillment {
        ...Fulfillment
        lines {
            orderLine {
                ...OrderLineWithMetadata
                __typename
            }
            __typename
        }
        __typename
    }

    fragment OrderLineWithMetadata on OrderLine {
        ...OrderLine
        variant {
            metadata {
                ...MetadataItem
                __typename
            }
            privateMetadata @include(if: $isStaffUser) {
                ...MetadataItem
                __typename
            }
            __typename
            product {
                category {
                    name
                }
            }
        }
        __typename
    }

    fragment PaymentGateway on PaymentGateway {
        name
        id
        __typename
    }
`;

export const CREATE_NOTES = gql`
    mutation OrderNoteAdd($input: OrderNoteInput!, $orderId: ID!, $private_note: Boolean!) {
        orderNoteAdd(input: $input, order: $orderId, private_note: $private_note) {
            order {
                id
                number
                user {
                    email
                    firstName
                    lastName
                }
                events {
                    id
                    message
                    type
                    date
                    user {
                        firstName
                        lastName
                        email
                    }
                }
            }
        }
    }
`;

export const UNFULFILLMENT_ORDER = gql`
    mutation OrderFulfillmentCancel($id: ID!, $input: FulfillmentCancelInput!) {
        orderFulfillmentCancel(id: $id, input: $input) {
            errors {
                ...OrderError
                __typename
            }
            order {
                ...OrderDetails
                __typename
            }
            __typename
        }
    }

    fragment OrderError on OrderError {
        code
        field
        addressType
        message
        orderLines
        __typename
    }

    fragment OrderDetails on Order {
        id
        token
        ...Metadata
        billingAddress {
            ...Address
            __typename
        }
        transactions {
            ...TransactionItem
            __typename
        }
        payments {
            ...OrderPayment
            __typename
        }
        giftCards {
            ...OrderGiftCard
            __typename
        }
        grantedRefunds {
            ...OrderGrantedRefund
            __typename
        }
        isShippingRequired
        canFinalize
        created
        customerNote
        discounts {
            id
            type
            calculationMode: valueType
            value
            reason
            amount {
                ...Money
                __typename
            }
            __typename
        }
        events {
            ...OrderEvent
            __typename
        }
        fulfillments {
            ...Fulfillment
            __typename
        }
        lines {
            ...OrderLine
            __typename
        }
        number
        isPaid
        paymentStatus
        shippingAddress {
            ...Address
            __typename
        }
        deliveryMethod {
            __typename
            ... on ShippingMethod {
                id
                __typename
            }
            ... on Warehouse {
                id
                clickAndCollectOption
                __typename
            }
        }
        shippingMethod {
            id
            __typename
        }
        shippingMethodName
        collectionPointName
        shippingPrice {
            gross {
                amount
                currency
                __typename
            }
            __typename
        }
        status
        subtotal {
            gross {
                ...Money
                __typename
            }
            net {
                ...Money
                __typename
            }
            __typename
        }
        total {
            gross {
                ...Money
                __typename
            }
            net {
                ...Money
                __typename
            }
            tax {
                ...Money
                __typename
            }
            __typename
        }
        totalRemainingGrant {
            ...Money
            __typename
        }
        totalGrantedRefund {
            ...Money
            __typename
        }
        totalRefundPending {
            ...Money
            __typename
        }
        totalRefunded {
            ...Money
            __typename
        }
        actions
        totalAuthorizePending {
            ...Money
            __typename
        }
        totalAuthorized {
            ...Money
            __typename
        }
        totalCaptured {
            ...Money
            __typename
        }
        totalCharged {
            ...Money
            __typename
        }
        totalChargePending {
            ...Money
            __typename
        }
        totalCanceled {
            ...Money
            __typename
        }
        totalCancelPending {
            ...Money
            __typename
        }
        totalBalance {
            ...Money
            __typename
        }
        undiscountedTotal {
            net {
                ...Money
                __typename
            }
            gross {
                ...Money
                __typename
            }
            __typename
        }
        user {
            id
            email
            __typename
        }
        userEmail
        shippingMethods {
            id
            name
            price {
                ...Money
                __typename
            }
            active
            message
            __typename
        }
        invoices {
            ...Invoice
            __typename
        }
        channel {
            isActive
            id
            name
            currencyCode
            slug
            defaultCountry {
                code
                __typename
            }
            orderSettings {
                markAsPaidStrategy
                __typename
            }
            __typename
        }
        isPaid
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }

    fragment Address on Address {
        city
        cityArea
        companyName
        country {
            __typename
            code
            country
        }
        countryArea
        firstName
        id
        lastName
        phone
        postalCode
        streetAddress1
        streetAddress2
        __typename
    }

    fragment TransactionItem on TransactionItem {
        id
        pspReference
        actions
        name
        externalUrl
        events {
            ...TransactionEvent
            __typename
        }
        authorizedAmount {
            ...Money
            __typename
        }
        chargedAmount {
            ...Money
            __typename
        }
        refundedAmount {
            ...Money
            __typename
        }
        canceledAmount {
            ...Money
            __typename
        }
        authorizePendingAmount {
            ...Money
            __typename
        }
        chargePendingAmount {
            ...Money
            __typename
        }
        refundPendingAmount {
            ...Money
            __typename
        }
        cancelPendingAmount {
            ...Money
            __typename
        }
        __typename
    }

    fragment TransactionEvent on TransactionEvent {
        id
        pspReference
        amount {
            ...Money
            __typename
        }
        type
        message
        createdAt
        createdBy {
            ... on User {
                ...StaffMemberAvatar
                __typename
            }
            ... on App {
                ...AppAvatar
                __typename
            }
            __typename
        }
        externalUrl
        __typename
    }

    fragment Money on Money {
        amount
        currency
        __typename
    }

    fragment StaffMemberAvatar on User {
        ...StaffMember
        avatar(size: 512) {
            url
            __typename
        }
        __typename
    }

    fragment StaffMember on User {
        id
        email
        firstName
        isActive
        lastName
        __typename
    }

    fragment AppAvatar on App {
        id
        name
        __typename
    }

    fragment OrderPayment on Payment {
        id
        isActive
        actions
        gateway
        paymentMethodType
        availableCaptureAmount {
            ...Money
            __typename
        }
        capturedAmount {
            ...Money
            __typename
        }
        total {
            ...Money
            __typename
        }
        availableRefundAmount {
            ...Money
            __typename
        }
        modified
        transactions {
            id
            token
            created
            kind
            isSuccess
            __typename
        }
        __typename
    }

    fragment OrderGiftCard on GiftCard {
        id
        last4CodeChars
        events {
            id
            type
            orderId
            date
            balance {
                initialBalance {
                    ...Money
                    __typename
                }
                currentBalance {
                    ...Money
                    __typename
                }
                oldInitialBalance {
                    ...Money
                    __typename
                }
                oldCurrentBalance {
                    ...Money
                    __typename
                }
                __typename
            }
            __typename
        }
        __typename
    }

    fragment OrderGrantedRefund on OrderGrantedRefund {
        id
        createdAt
        shippingCostsIncluded
        amount {
            currency
            amount
            __typename
        }
        reason
        user {
            ...UserBaseAvatar
            __typename
        }
        app {
            id
            name
            __typename
        }
        __typename
    }

    fragment UserBaseAvatar on User {
        id
        firstName
        lastName
        email
        avatar {
            url
            alt
            __typename
        }
        __typename
    }

    fragment OrderEvent on OrderEvent {
        id
        amount
        shippingCostsIncluded
        date
        email
        emailType
        invoiceNumber
        discount {
            valueType
            value
            reason
            amount {
                amount
                currency
                __typename
            }
            oldValueType
            oldValue
            oldAmount {
                amount
                currency
                __typename
            }
            __typename
        }
        relatedOrder {
            id
            number
            __typename
        }
        message
        quantity
        transactionReference
        type
        user {
            id
            email
            firstName
            lastName
            __typename
        }
        app {
            id
            name
            appUrl
            __typename
        }
        lines {
            quantity
            itemName
            discount {
                valueType
                value
                reason
                amount {
                    amount
                    currency
                    __typename
                }
                oldValueType
                oldValue
                oldAmount {
                    amount
                    currency
                    __typename
                }
                __typename
            }
            orderLine {
                id
                productName
                variantName
                __typename
            }
            __typename
        }
        __typename
    }

    fragment Fulfillment on Fulfillment {
        ...Metadata
        id
        lines {
            id
            quantity
            orderLine {
                ...OrderLine
                __typename
            }
            __typename
        }
        fulfillmentOrder
        status
        trackingNumber
        warehouse {
            id
            name
            __typename
        }
        __typename
    }

    fragment OrderLine on OrderLine {
        id
        isShippingRequired
        allocations {
            id
            quantity
            warehouse {
                id
                name
                __typename
            }
            __typename
        }
        variant {
            id
            name
            quantityAvailable
            preorder {
                endDate
                __typename
            }
            stocks {
                ...Stock
                __typename
            }
            product {
                id
                isAvailableForPurchase
                __typename
            }
            __typename
        }
        productName
        productSku
        quantity
        quantityFulfilled
        quantityToFulfill
        totalPrice {
            ...TaxedMoney
            __typename
        }
        unitDiscount {
            amount
            currency
            __typename
        }
        unitDiscountValue
        unitDiscountReason
        unitDiscountType
        undiscountedUnitPrice {
            currency
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        unitPrice {
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        thumbnail {
            url
            __typename
        }
        __typename
    }

    fragment Stock on Stock {
        id
        quantity
        quantityAllocated
        warehouse {
            ...Warehouse
            __typename
        }
        __typename
    }

    fragment Warehouse on Warehouse {
        id
        name
        __typename
    }

    fragment TaxedMoney on TaxedMoney {
        net {
            ...Money
            __typename
        }
        gross {
            ...Money
            __typename
        }
        __typename
    }

    fragment Invoice on Invoice {
        id
        number
        createdAt
        url
        status
        __typename
    }
`;

export const UPDATE_NOTES = gql`
    mutation Shipping_CarrierUpdate($id: ID!, $input: Shipping_CarrierInput!) {
        shippingCarrierUpdate(id: $id, input: $input) {
            shippingCarrier {
                id
                name
                trackingUrl
            }
        }
    }
`;

export const DELETE_NOTES = gql`
    mutation OrderNoteDelete($noteId: ID!) {
        orderNoteDelete(id: $noteId) {
            errors {
                message
            }
        }
    }
`;

export const STATE_LIST = gql`
    query CountryArea($code: CountryCode!) {
        addressValidationRules(countryCode: $code) {
            countryAreaChoices {
                raw
                verbose
            }
        }
    }
`;

export const UPDATE_SHIPPING_COUNTRY = gql`
    mutation checkoutShippingAddressUpdate($checkoutId: ID!, $shippingAddress: AddressInput!, $validationRules: CheckoutAddressValidationRules) {
        checkoutShippingAddressUpdate(id: $checkoutId, shippingAddress: $shippingAddress, validationRules: $validationRules) {
            errors {
                ...CheckoutErrorFragment
                __typename
            }

            __typename
        }
    }
    fragment CheckoutErrorFragment on CheckoutError {
        message
        field
        code
        __typename
    }
`;

export const COUNTRY_LIST = gql`
    query CountryList {
        shop {
            countries {
                code
                country
            }
        }
    }
`;

export const ADD_CUSTOMER = gql`
    mutation CreateCustomer($input: UserCreateInput!) {
        customerCreate(input: $input) {
            errors {
                ...AccountError
                __typename
            }
            user {
                id
                __typename
            }
            __typename
        }
    }

    fragment AccountError on AccountError {
        code
        field
        addressType
        message
        __typename
    }
`;

export const RESET_PASSWORD = gql`
    mutation Password_Reset($email: String!) {
        passwordReset(email: $email) {
            success
            message
        }
    }
`;

export const UPDATE_CUSTOMER = gql`
    mutation UpdateCustomer($id: ID!, $input: CustomerInput!) {
        customerUpdate(id: $id, input: $input) {
            errors {
                ...AccountError
                __typename
            }
            user {
                ...CustomerDetails
                __typename
            }
            __typename
        }
    }

    fragment AccountError on AccountError {
        code
        field
        addressType
        message
        __typename
    }

    fragment CustomerDetails on User {
        ...Customer
        ...Metadata
        dateJoined
        lastLogin
        defaultShippingAddress {
            ...Address
            __typename
        }
        defaultBillingAddress {
            ...Address
            __typename
        }
        note
        isActive
        __typename
    }

    fragment Customer on User {
        id
        email
        firstName
        lastName
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }

    fragment Address on Address {
        city
        cityArea
        companyName
        country {
            __typename
            code
            country
        }
        countryArea
        firstName
        id
        lastName
        phone
        postalCode
        streetAddress1
        streetAddress2
        __typename
    }
`;

export const CUSTOMER_DETAILS = gql`
    query CustomerDetails($id: ID!, $PERMISSION_MANAGE_ORDERS: Boolean!) {
        user(id: $id) {
            ...CustomerDetails
            orders(last: 5) @include(if: $PERMISSION_MANAGE_ORDERS) {
                edges {
                    node {
                        id
                        created
                        number
                        paymentStatus
                        total {
                            gross {
                                currency
                                amount
                                __typename
                            }
                            __typename
                        }
                        __typename
                    }
                    __typename
                }
                __typename
            }
            lastPlacedOrder: orders(last: 1) @include(if: $PERMISSION_MANAGE_ORDERS) {
                edges {
                    node {
                        id
                        created
                        __typename
                    }
                    __typename
                }
                __typename
            }
            __typename
        }
    }

    fragment CustomerDetails on User {
        ...Customer
        ...Metadata
        dateJoined
        lastLogin
        defaultShippingAddress {
            ...Address
            __typename
        }
        defaultBillingAddress {
            ...Address
            __typename
        }
        note
        isActive
        __typename
    }

    fragment Customer on User {
        id
        email
        firstName
        lastName
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }

    fragment Address on Address {
        city
        cityArea
        companyName
        country {
            __typename
            code
            country
        }
        countryArea
        firstName
        id
        lastName
        phone
        postalCode
        streetAddress1
        streetAddress2
        __typename
    }
`;

export const STATES_LIST = gql`
    query CountryArea($code: CountryCode!) {
        addressValidationRules(countryCode: $code) {
            countryAreaChoices {
                raw
                verbose
            }
        }
    }
`;

export const UPDATE_CUSTOMER_ADDRESS = gql`
    mutation UpdateCustomerAddress($id: ID!, $input: AddressInput!) {
        addressUpdate(id: $id, input: $input) {
            errors {
                ...AccountError
                __typename
            }
            address {
                ...Address
                __typename
            }
            __typename
        }
    }

    fragment AccountError on AccountError {
        code
        field
        addressType
        message
        __typename
    }

    fragment Address on Address {
        city
        cityArea
        companyName
        country {
            __typename
            code
            country
        }
        countryArea
        firstName
        id
        lastName
        phone
        postalCode
        streetAddress1
        streetAddress2
        __typename
    }
`;

export const FINALIZE_ORDER = gql`
    mutation OrderDraftFinalize($id: ID!) {
        draftOrderComplete(id: $id) {
            errors {
                ...OrderError
                __typename
            }
            order {
                ...OrderDetails
                __typename
            }
            __typename
        }
    }

    fragment OrderError on OrderError {
        code
        field
        addressType
        message
        orderLines
        __typename
    }

    fragment OrderDetails on Order {
        id
        token
        ...Metadata
        billingAddress {
            ...Address
            __typename
        }
        transactions {
            ...TransactionItem
            __typename
        }
        payments {
            ...OrderPayment
            __typename
        }
        giftCards {
            ...OrderGiftCard
            __typename
        }
        grantedRefunds {
            ...OrderGrantedRefund
            __typename
        }
        isShippingRequired
        canFinalize
        created
        customerNote
        discounts {
            id
            type
            calculationMode: valueType
            value
            reason
            amount {
                ...Money
                __typename
            }
            __typename
        }
        events {
            ...OrderEvent
            __typename
        }
        fulfillments {
            ...Fulfillment
            __typename
        }
        lines {
            ...OrderLine
            __typename
        }
        number
        isPaid
        paymentStatus
        shippingAddress {
            ...Address
            __typename
        }
        deliveryMethod {
            __typename
            ... on ShippingMethod {
                id
                __typename
            }
            ... on Warehouse {
                id
                clickAndCollectOption
                __typename
            }
        }
        shippingMethod {
            id
            __typename
        }
        shippingMethodName
        collectionPointName
        shippingPrice {
            gross {
                amount
                currency
                __typename
            }
            __typename
        }
        status
        subtotal {
            gross {
                ...Money
                __typename
            }
            net {
                ...Money
                __typename
            }
            __typename
        }
        total {
            gross {
                ...Money
                __typename
            }
            net {
                ...Money
                __typename
            }
            tax {
                ...Money
                __typename
            }
            __typename
        }
        totalRemainingGrant {
            ...Money
            __typename
        }
        totalGrantedRefund {
            ...Money
            __typename
        }
        totalRefundPending {
            ...Money
            __typename
        }
        totalRefunded {
            ...Money
            __typename
        }
        actions
        totalAuthorizePending {
            ...Money
            __typename
        }
        totalAuthorized {
            ...Money
            __typename
        }
        totalCaptured {
            ...Money
            __typename
        }
        totalCharged {
            ...Money
            __typename
        }
        totalChargePending {
            ...Money
            __typename
        }
        totalCanceled {
            ...Money
            __typename
        }
        totalCancelPending {
            ...Money
            __typename
        }
        totalBalance {
            ...Money
            __typename
        }
        undiscountedTotal {
            net {
                ...Money
                __typename
            }
            gross {
                ...Money
                __typename
            }
            __typename
        }
        user {
            id
            email
            __typename
        }
        userEmail
        shippingMethods {
            id
            name
            price {
                ...Money
                __typename
            }
            active
            message
            __typename
        }
        invoices {
            ...Invoice
            __typename
        }
        channel {
            isActive
            id
            name
            currencyCode
            slug
            defaultCountry {
                code
                __typename
            }
            orderSettings {
                markAsPaidStrategy
                __typename
            }
            __typename
        }
        isPaid
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }

    fragment Address on Address {
        city
        cityArea
        companyName
        country {
            __typename
            code
            country
        }
        countryArea
        firstName
        id
        lastName
        phone
        postalCode
        streetAddress1
        streetAddress2
        __typename
    }

    fragment TransactionItem on TransactionItem {
        id
        pspReference
        actions
        name
        externalUrl
        events {
            ...TransactionEvent
            __typename
        }
        authorizedAmount {
            ...Money
            __typename
        }
        chargedAmount {
            ...Money
            __typename
        }
        refundedAmount {
            ...Money
            __typename
        }
        canceledAmount {
            ...Money
            __typename
        }
        authorizePendingAmount {
            ...Money
            __typename
        }
        chargePendingAmount {
            ...Money
            __typename
        }
        refundPendingAmount {
            ...Money
            __typename
        }
        cancelPendingAmount {
            ...Money
            __typename
        }
        __typename
    }

    fragment TransactionEvent on TransactionEvent {
        id
        pspReference
        amount {
            ...Money
            __typename
        }
        type
        message
        createdAt
        createdBy {
            ... on User {
                ...StaffMemberAvatar
                __typename
            }
            ... on App {
                ...AppAvatar
                __typename
            }
            __typename
        }
        externalUrl
        __typename
    }

    fragment Money on Money {
        amount
        currency
        __typename
    }

    fragment StaffMemberAvatar on User {
        ...StaffMember
        avatar(size: 512) {
            url
            __typename
        }
        __typename
    }

    fragment StaffMember on User {
        id
        email
        firstName
        isActive
        lastName
        __typename
    }

    fragment AppAvatar on App {
        id
        name
        __typename
    }

    fragment OrderPayment on Payment {
        id
        isActive
        actions
        gateway
        paymentMethodType
        availableCaptureAmount {
            ...Money
            __typename
        }
        capturedAmount {
            ...Money
            __typename
        }
        total {
            ...Money
            __typename
        }
        availableRefundAmount {
            ...Money
            __typename
        }
        modified
        transactions {
            id
            token
            created
            kind
            isSuccess
            __typename
        }
        __typename
    }

    fragment OrderGiftCard on GiftCard {
        id
        last4CodeChars
        events {
            id
            type
            orderId
            date
            balance {
                initialBalance {
                    ...Money
                    __typename
                }
                currentBalance {
                    ...Money
                    __typename
                }
                oldInitialBalance {
                    ...Money
                    __typename
                }
                oldCurrentBalance {
                    ...Money
                    __typename
                }
                __typename
            }
            __typename
        }
        __typename
    }

    fragment OrderGrantedRefund on OrderGrantedRefund {
        id
        createdAt
        shippingCostsIncluded
        amount {
            currency
            amount
            __typename
        }
        reason
        user {
            ...UserBaseAvatar
            __typename
        }
        app {
            id
            name
            __typename
        }
        __typename
    }

    fragment UserBaseAvatar on User {
        id
        firstName
        lastName
        email
        avatar {
            url
            alt
            __typename
        }
        __typename
    }

    fragment OrderEvent on OrderEvent {
        id
        amount
        shippingCostsIncluded
        date
        email
        emailType
        invoiceNumber
        discount {
            valueType
            value
            reason
            amount {
                amount
                currency
                __typename
            }
            oldValueType
            oldValue
            oldAmount {
                amount
                currency
                __typename
            }
            __typename
        }
        relatedOrder {
            id
            number
            __typename
        }
        message
        quantity
        transactionReference
        type
        user {
            id
            email
            firstName
            lastName
            __typename
        }
        app {
            id
            name
            appUrl
            __typename
        }
        lines {
            quantity
            itemName
            discount {
                valueType
                value
                reason
                amount {
                    amount
                    currency
                    __typename
                }
                oldValueType
                oldValue
                oldAmount {
                    amount
                    currency
                    __typename
                }
                __typename
            }
            orderLine {
                id
                productName
                variantName
                __typename
            }
            __typename
        }
        __typename
    }

    fragment Fulfillment on Fulfillment {
        ...Metadata
        id
        lines {
            id
            quantity
            orderLine {
                ...OrderLine
                __typename
            }
            __typename
        }
        fulfillmentOrder
        status
        trackingNumber
        warehouse {
            id
            name
            __typename
        }
        __typename
    }

    fragment OrderLine on OrderLine {
        id
        isShippingRequired
        allocations {
            id
            quantity
            warehouse {
                id
                name
                __typename
            }
            __typename
        }
        variant {
            id
            name
            quantityAvailable
            preorder {
                endDate
                __typename
            }
            stocks {
                ...Stock
                __typename
            }
            product {
                id
                isAvailableForPurchase
                __typename
            }
            __typename
        }
        productName
        productSku
        quantity
        quantityFulfilled
        quantityToFulfill
        totalPrice {
            ...TaxedMoney
            __typename
        }
        unitDiscount {
            amount
            currency
            __typename
        }
        unitDiscountValue
        unitDiscountReason
        unitDiscountType
        undiscountedUnitPrice {
            currency
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        unitPrice {
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        thumbnail {
            url
            __typename
        }
        __typename
    }

    fragment Stock on Stock {
        id
        quantity
        quantityAllocated
        warehouse {
            ...Warehouse
            __typename
        }
        __typename
    }

    fragment Warehouse on Warehouse {
        id
        name
        __typename
    }

    fragment TaxedMoney on TaxedMoney {
        net {
            ...Money
            __typename
        }
        gross {
            ...Money
            __typename
        }
        __typename
    }

    fragment Invoice on Invoice {
        id
        number
        createdAt
        url
        status
        __typename
    }
`;

export const CHANNEL_LIST = gql`
    query BaseChannels {
        channels {
            ...Channel
            __typename
        }
    }

    fragment Channel on Channel {
        id
        isActive
        name
        slug
        currencyCode
        defaultCountry {
            code
            country
            __typename
        }
        stockSettings {
            allocationStrategy
            __typename
        }
        __typename
    }
`;

export const PRODUCT_CAT_LIST = gql`
    query SearchCategories($after: String, $first: Int!, $query: String!) {
        search: categories(after: $after, first: $first, filter: { search: $query }) {
            edges {
                node {
                    id
                    name
                    __typename
                }
                __typename
            }
            pageInfo {
                ...PageInfo
                __typename
            }
            __typename
        }
    }

    fragment PageInfo on PageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
        __typename
    }
`;

export const COLLECTION_LIST = gql`
    query SearchCollections($after: String, $first: Int!, $query: String!, $channel: String) {
        search: collections(after: $after, first: $first, filter: { search: $query }, channel: $channel) {
            edges {
                node {
                    id
                    name
                    __typename
                }
                __typename
            }
            pageInfo {
                ...PageInfo
                __typename
            }
            __typename
        }
    }

    fragment PageInfo on PageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
        __typename
    }
`;

export const PRODUCT_TYPE_LIST = gql`
    query SearchProductTypes($after: String, $first: Int!, $query: String!) {
        search: productTypes(after: $after, first: $first, filter: { search: $query }) {
            edges {
                node {
                    id
                    name
                    __typename
                }
                __typename
            }
            pageInfo {
                ...PageInfo
                __typename
            }
            __typename
        }
    }

    fragment PageInfo on PageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
        __typename
    }
`;

export const SALES_BY_DATE = gql`
    mutation SalesByDate($fromdate: String!, $toDate: String!, $currency: String!) {
        salesByDate(fromDate: $fromdate, inputString: $currency, toDate: $toDate) {
            totalItemsSoldList
            shippingAmountList
            codAmountList
            giftwrapAmountList
            refundAmountList
            noOfOrderList
            dates
            couponAmountList
            productsTotalAmount
            couponAmountListTotal
            noOfOrderListCount
            productsTotalAmountTotal
            refundAmountListTotal
            shippingAmountListTotal
            totalItemsSoldListCount
            codAmountListTotal
            giftwrapAmountListTotal
        }
    }
`;

export const SALES_BY_PRODUCT = gql`
    mutation SalesByProduct($fromdate: String!, $toDate: String!, $currency: String!) {
        salesByProduct(fromDate: $fromdate, inputString: $currency, toDate: $toDate) {
            topProducts
        }
    }
`;

export const SALES_BY_SINGLE_PRODUCT = gql`
    mutation SalesByProduct($fromdate: String!, $toDate: String!, $currency: String!, $productid: String!) {
        salesByProduct(fromDate: $fromdate, inputString: $currency, toDate: $toDate, productid: $productid) {
            dates
            totalItemsSoldList
            productsTotalAmount
        }
    }
`;

export const SALES_BY_CATEGORY = gql`
    mutation SalesByCategory($fromdate: String!, $toDate: String!, $currency: String!, $categoryid: [ID!]!) {
        salesByCategory(fromDate: $fromdate, inputString: $currency, toDate: $toDate, categoryid: $categoryid) {
            dates
            outputData
        }
    }
`;

export const SALES_BY_COUPON = gql`
    mutation SalesByCoupon($fromdate: String!, $toDate: String!) {
        salesByCoupon(fromDate: $fromdate, toDate: $toDate) {
            dates
            dates
            discountAmount
            noOfCouponsUsed
        }
    }
`;

export const ANALYSIS_BY_ORDER = gql`
    mutation OrderAnalysis($fromdate: String!, $toDate: String!, $categoryIds: [ID!]!, $countryCodeList: [String!]!, $productIds: [ID]!) {
        orderAnalysis(fromDate: $fromdate, toDate: $toDate, categoryIds: $categoryIds, countryCodeList: $countryCodeList, productIds: $productIds) {
            dates
            dates
            countries
            outputData
        }
    }
`;
export const ANALYSIS_BY_REVENUE = gql`
    mutation orderRevenue($currency: String!, $fromdate: String!, $toDate: String!, $categoryIds: [ID!]!, $countryCodeList: [String!]!, $productIds: [ID]!) {
        orderRevenue(fromDate: $fromdate, toDate: $toDate, categoryIds: $categoryIds, countryCodeList: $countryCodeList, productIds: $productIds, currency: $currency) {
            dates
            countries
            outputData
        }
    }
`;

export const ANALYSIS_BY_CUSTOMER = gql`
    mutation Customer($currency: String!, $fromdate: String!, $toDate: String!, $categoryIds: [ID!]!, $countryCodeList: [String!]!, $productIds: [ID]!) {
        orderCustomer(fromDate: $fromdate, toDate: $toDate, categoryIds: $categoryIds, countryCodeList: $countryCodeList, productIds: $productIds, currency: $currency) {
            countries
            customers
            revenue
        }
    }
`;

export const ANALYSIS_BY_PRODUCT_REVENUE = gql`
    mutation orderProductsAmountByCountry($currency: String!, $fromdate: String!, $toDate: String!, $categoryIds: [ID!]!, $countryCodeList: [String!]!, $productIds: [ID]!) {
        orderProductsAmountByCountry(fromDate: $fromdate, toDate: $toDate, categoryIds: $categoryIds, countryCodeList: $countryCodeList, productIds: $productIds, currency: $currency) {
            countries
            outputData
            productsName
        }
    }
`;

export const PRODUCT_BY_COUNTRY = gql`
    mutation orderProductsByCountry($fromdate: String!, $toDate: String!, $categoryIds: [ID!]!, $countryCodeList: [String!]!, $productIds: [ID]!) {
        orderProductsByCountry(fromDate: $fromdate, toDate: $toDate, categoryIds: $categoryIds, countryCodeList: $countryCodeList, productIds: $productIds) {
            countries
            outputData
            productsName
        }
    }
`;

export const PRODUCT_BY_NAME = gql`
    query ProductSearch($name: String!) {
        products(search: $name, channel: "india-channel", first: 20, sortBy: { direction: ASC, field: NAME }) {
            edges {
                node {
                    id
                    name
                }
            }
        }
    }
`;

export const LOW_STOCK_LIST = gql`
    query ProductListPaginated($channel: String!, $first: Int, $last: Int, $after: String, $before: String, $filter: ProductFilterInput!, $search: String) {
        products(filter: $filter, first: $first, after: $after, before: $before, channel: $channel, last: $last, search: $search, sortBy: { direction: ASC, field: NAME }) {
            totalCount
            edges {
                node {
                    id
                    name
                    __typename
                }
                __typename
            }
            pageInfo {
                endCursor
                hasNextPage
                hasPreviousPage
                startCursor
                __typename
            }
            __typename
        }
    }
`;

export const ANALYSIS_PRODUCT_BY_COUNTRY = gql`
    mutation Customer($currency: String!, $fromdate: String!, $toDate: String!, $categoryIds: [ID!]!, $countryCodeList: [String!]!, $productIds: [ID]!) {
        orderSalesByCountry(fromDate: $fromdate, toDate: $toDate, categoryIds: $categoryIds, countryCodeList: $countryCodeList, productIds: $productIds, currency: $currency) {
            countries
            orders
            revenue
        }
    }
`;

export const GUEST_LIST = gql`
    mutation questReport($fromdate: String, $toDate: String) {
        questReport(fromDate: $fromdate, toDate: $toDate) {
            __typename
            nameList
            moneySpentList
            lastOrderIds
            lastOrderDate
            lastOrder
            emailList
        }
    }
`;

export const CUSTOMER_REPORT_LIST = gql`
    mutation {
        customerReport {
            nameList
            userIds
            emailList
            moneySpentList
            lastOrder
            lastOrderIds
            lastOrderDate
        }
    }
`;

export const CREATE_PRODUCT = gql`
    mutation ProductCreate($input: ProductCreateInput!) {
        productCreate(input: $input) {
            errors {
                ...ProductErrorWithAttributes
                __typename
            }
            product {
                id
                __typename
            }
            __typename
        }
    }

    fragment ProductErrorWithAttributes on ProductError {
        ...ProductError
        attributes
        __typename
    }

    fragment ProductError on ProductError {
        code
        field
        message
        __typename
    }
`;

export const PRODUCT_MEDIA_CREATE_NEW = gql`
    mutation productMediaCreate($productId: ID!, $media_url: String!, $alt: String!) {
        productMediaCreate(input: { product: $productId, alt: $alt, mediaUrl: $media_url }) {
            product {
                id
                name
            }
            media {
                id
                url
                alt
                oembedData
            }
            errors {
                field
                message
            }
        }
    }
`;

export const UPDATE_PRODUCT_CHANNEL = gql`
    mutation ProductChannelListingUpdate($id: ID!, $input: ProductChannelListingUpdateInput!) {
        productChannelListingUpdate(id: $id, input: $input) {
            errors {
                ...ProductChannelListingError
                __typename
            }
            __typename
        }
    }

    fragment ProductChannelListingError on ProductChannelListingError {
        code
        field
        message
        channels
        __typename
    }
`;

export const CREATE_VARIANT = gql`
    mutation ProductVariantBulkCreate($id: ID!, $inputs: [ProductVariantBulkCreateInput!]!) {
        productVariantBulkCreate(product: $id, variants: $inputs) {
            errors {
                ...BulkProductError
                __typename
            }
            productVariants {
                id
                __typename
            }
            __typename
        }
    }

    fragment BulkProductError on BulkProductError {
        field
        code
        index
        channels
        message
        __typename
    }
`;

export const GET_ATTRIBUTE_BY_PRODUCT_TYPE = gql`
    query ProductType($id: ID!, $firstValues: Int, $afterValues: String, $lastValues: Int, $beforeValues: String) {
        productType(id: $id) {
            id
            name
            hasVariants
            productAttributes {
                id
                inputType
                entityType
                slug
                name
                valueRequired
                unit
                choices(first: $firstValues, after: $afterValues, last: $lastValues, before: $beforeValues) {
                    ...AttributeValueList
                    __typename
                }
                __typename
            }
            taxClass {
                id
                name
                __typename
            }
            __typename
        }
    }

    fragment AttributeValueList on AttributeValueCountableConnection {
        pageInfo {
            ...PageInfo
            __typename
        }
        edges {
            cursor
            node {
                ...AttributeValueDetails
                __typename
            }
            __typename
        }
        __typename
    }

    fragment PageInfo on PageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
        __typename
    }

    fragment AttributeValueDetails on AttributeValue {
        ...AttributeValue
        plainText
        richText
        __typename
    }

    fragment AttributeValue on AttributeValue {
        id
        name
        slug
        file {
            ...File
            __typename
        }
        reference
        boolean
        date
        dateTime
        value
        __typename
    }

    fragment File on File {
        url
        contentType
        __typename
    }
`;

export const UPDATE_VARIANT = gql`
    mutation ProductVariantBulkUpdate($product: ID!, $input: [ProductVariantBulkUpdateInput!]!, $errorPolicy: ErrorPolicyEnum) {
        productVariantBulkUpdate(errorPolicy: $errorPolicy, product: $product, variants: $input) {
            errors {
                ...ProductVariantBulkError
                __typename
            }
            results {
                errors {
                    ...ProductVariantBulkError
                    __typename
                }
                __typename
            }
            __typename
        }
    }

    fragment ProductVariantBulkError on ProductVariantBulkError {
        field
        code
        message
        attributes
        values
        warehouses
        channels
        __typename
    }
`;

export const UPDATE_META_DATA = gql`
    mutation UpdateMetadata($id: ID!, $input: [MetadataInput!]!, $keysToDelete: [String!]!) {
        updateMetadata(id: $id, input: $input) {
            errors {
                ...MetadataError
                __typename
            }
            item {
                ...Metadata
                ... on Node {
                    id
                    __typename
                }
                __typename
            }
            __typename
        }
        deleteMetadata(id: $id, keys: $keysToDelete) {
            errors {
                ...MetadataError
                __typename
            }
            item {
                ...Metadata
                ... on Node {
                    id
                    __typename
                }
                __typename
            }
            __typename
        }
    }

    fragment MetadataError on MetadataError {
        code
        field
        message
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }
`;

export const UPDATE_VARIANT_LIST = gql`
    mutation ProductVariantChannelListingUpdate($id: ID!, $input: [ProductVariantChannelListingAddInput!]!) {
        productVariantChannelListingUpdate(id: $id, input: $input) {
            variant {
                id
                channelListings {
                    ...ChannelListingProductVariant
                    __typename
                }
                product {
                    id
                    channelListings {
                        ...ChannelListingProductWithoutPricing
                        __typename
                    }
                    __typename
                }
                __typename
            }
            errors {
                ...ProductChannelListingError
                __typename
            }
            __typename
        }
    }

    fragment ChannelListingProductVariant on ProductVariantChannelListing {
        id
        channel {
            id
            name
            currencyCode
            __typename
        }
        price {
            ...Money
            __typename
        }
        costPrice {
            ...Money
            __typename
        }
        preorderThreshold {
            quantity
            soldUnits
            __typename
        }
        __typename
    }

    fragment Money on Money {
        amount
        currency
        __typename
    }

    fragment ChannelListingProductWithoutPricing on ProductChannelListing {
        isPublished
        publicationDate
        isAvailableForPurchase
        availableForPurchase
        visibleInListings
        channel {
            id
            name
            currencyCode
            __typename
        }
        __typename
    }

    fragment ProductChannelListingError on ProductChannelListingError {
        code
        field
        message
        channels
        __typename
    }
`;

export const PRODUCT_MEDIA_CREATE = gql`
    mutation ProductMediaCreate($product: ID!, $image: Upload, $alt: String, $mediaUrl: String) {
        productMediaCreate(input: { product: $product, image: $image, alt: $alt, mediaUrl: $mediaUrl }) {
            errors {
                ...ProductError
                __typename
            }
            product {
                id
                media {
                    ...ProductMedia
                    __typename
                }
                __typename
            }
            __typename
        }
    }

    fragment ProductError on ProductError {
        code
        field
        message
        __typename
    }

    fragment ProductMedia on ProductMedia {
        id
        alt
        sortOrder
        url(size: 1024)
        type
        oembedData
        __typename
    }
`;

export const PRODUCT_FULL_DETAILS = gql`
    query ProductDetails($id: ID!, $channel: String, $firstValues: Int, $afterValues: String, $lastValues: Int, $beforeValues: String) {
        product(id: $id, channel: $channel) {
            metadata {
                key
                value
                __typename
            }
            attributes {
                attribute {
                    id
                    slug
                    name
                    inputType
                    entityType
                    valueRequired
                    unit
                    choices(first: 200) {
                        ...AttributeValueList
                        __typename
                    }
                    __typename
                }
                values {
                    ...AttributeValueDetails
                    __typename
                }
                __typename
            }
            ...Product
            __typename
            getUpsells {
                name
                productId
                __typename
            }
            getCrosssells {
                name
                productId
                __typename
            }
            productFinish {
                id
                name
                __typename
            }
            productStoneType {
                id
                name
                __typename
            }
            productstyle {
                id
                name
                __typename
            }
            prouctDesign {
                id
                name
                __typename
            }
            productStonecolor {
                id
                name
                __typename
            }
            productSize {
                id
                name
                __typename
            }
            productItemtype {
                id
                name
                __typename
            }
            attributes {
                attribute {
                    id
                }
            }
        }
    }

    fragment Product on Product {
        ...ProductVariantAttributes
        name
        slug
        description
        seoTitle
        seoDescription
        rating
        defaultVariant {
            id
            __typename
        }
        category {
            id
            name
            __typename
        }
        collections {
            id
            name
            __typename
        }
        channelListings {
            ...ChannelListingProductWithoutPricing
            __typename
        }
        media {
            ...ProductMedia
            __typename
        }
        isAvailable
        variants {
            ...ProductDetailsVariant
            __typename
        }
        productType {
            id
            name
            hasVariants
            __typename
        }
        weight {
            ...Weight
            __typename
        }
        taxClass {
            id
            name
            __typename
        }
        __typename
        productFinish {
            id
            name
            __typename
        }
        productStoneType {
            id
            name
            __typename
        }
        productstyle {
            id
            name
            __typename
        }
        prouctDesign {
            id
            name
            __typename
        }
        productStonecolor {
            id
            name
            __typename
        }
        productSize {
            id
            name
            __typename
        }
        productItemtype {
            id
            name
            __typename
        }
        orderNo
        tags {
            id
            name
            __typename
        }
    }

    fragment ProductVariantAttributes on Product {
        id
        attributes {
            attribute {
                id
                slug
                name
                inputType
                entityType
                valueRequired
                unit
                __typename
            }
            values {
                ...AttributeValueDetails
                __typename
            }
            __typename
        }
        productType {
            id
            variantAttributes {
                ...VariantAttribute
                __typename
            }
            __typename
        }
        channelListings {
            channel {
                id
                name
                currencyCode
                __typename
            }
            __typename
        }
        __typename
        thumbnail {
            url
            alt
            __typename
        }
    }

    fragment AttributeValueList on AttributeValueCountableConnection {
        pageInfo {
            ...PageInfo
            __typename
        }
        edges {
            cursor
            node {
                ...AttributeValueDetails
                __typename
            }
            __typename
        }
        __typename
    }

    fragment PageInfo on PageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
        __typename
    }

    fragment AttributeValueDetails on AttributeValue {
        ...AttributeValue
        plainText
        richText
        __typename
    }

    fragment AttributeValue on AttributeValue {
        id
        name
        slug
        file {
            ...File
            __typename
        }
        reference
        boolean
        date
        dateTime
        value
        __typename
    }

    fragment File on File {
        url
        contentType
        __typename
    }

    fragment VariantAttribute on Attribute {
        id
        name
        slug
        inputType
        entityType
        valueRequired
        unit
        choices(first: $firstValues, after: $afterValues, last: $lastValues, before: $beforeValues) {
            ...AttributeValueList
            __typename
        }
        __typename
    }

    fragment ChannelListingProductWithoutPricing on ProductChannelListing {
        isPublished
        publicationDate
        isAvailableForPurchase
        availableForPurchase
        visibleInListings
        channel {
            id
            name
            currencyCode
            __typename
        }
        __typename
    }

    fragment ProductMedia on ProductMedia {
        id
        alt
        sortOrder
        url(size: 1024)
        type
        oembedData
        __typename
    }

    fragment ProductDetailsVariant on ProductVariant {
        id
        sku
        name
        attributes {
            attribute {
                id
                name
                __typename
            }
            values {
                ...AttributeValueDetails
                __typename
            }
            __typename
        }
        media {
            url(size: 200)
            __typename
        }
        stocks {
            ...Stock
            __typename
        }
        trackInventory
        preorder {
            ...Preorder
            __typename
        }
        channelListings {
            ...ChannelListingProductVariant
            __typename
        }
        quantityLimitPerCustomer
        __typename
    }

    fragment Stock on Stock {
        id
        quantity
        quantityAllocated
        warehouse {
            ...Warehouse
            __typename
        }
        __typename
    }

    fragment Warehouse on Warehouse {
        id
        name
        __typename
    }

    fragment Preorder on PreorderData {
        globalThreshold
        globalSoldUnits
        endDate
        __typename
    }

    fragment ChannelListingProductVariant on ProductVariantChannelListing {
        id
        channel {
            id
            name
            currencyCode
            __typename
        }
        price {
            ...Money
            __typename
        }
        costPrice {
            ...Money
            __typename
        }
        preorderThreshold {
            quantity
            soldUnits
            __typename
        }
        __typename
    }

    fragment Money on Money {
        amount
        currency
        __typename
    }

    fragment Weight on Weight {
        unit
        value
        __typename
    }
`;

export const PRODUCT_DETAILS = gql`
    query ProductDetails($id: ID!, $channel: String, $firstValues: Int, $afterValues: String, $lastValues: Int, $beforeValues: String) {
        product(id: $id, channel: $channel) {
            ...Product
            __typename
        }
    }

    fragment Product on Product {
        ...ProductVariantAttributes
        ...Metadata
        name
        slug
        description
        seoTitle
        seoDescription
        rating
        defaultVariant {
            id
            __typename
        }
        category {
            id
            name
            __typename
        }
        collections {
            id
            name
            __typename
        }
        channelListings {
            ...ChannelListingProductWithoutPricing
            __typename
        }
        media {
            ...ProductMedia
            __typename
        }
        isAvailable
        variants {
            ...ProductDetailsVariant
            __typename
        }
        productType {
            id
            name
            hasVariants
            __typename
        }
        weight {
            ...Weight
            __typename
        }
        taxClass {
            id
            name
            __typename
        }
        __typename
        productFinish {
            id
            name
        }
        productStoneType {
            id
            name
        }
        productstyle {
            id
            name
        }
        prouctDesign {
            id
            name
        }
        orderNo
        tags {
            id
            name
        }
    }

    fragment ProductVariantAttributes on Product {
        id
        attributes {
            attribute {
                id
                slug
                name
                inputType
                entityType
                valueRequired
                unit
                choices(first: $firstValues, after: $afterValues, last: $lastValues, before: $beforeValues) {
                    ...AttributeValueList
                    __typename
                }
                __typename
            }
            values {
                ...AttributeValueDetails
                __typename
            }
            __typename
        }
        productType {
            id
            variantAttributes {
                ...VariantAttribute
                __typename
            }
            __typename
        }
        channelListings {
            channel {
                id
                name
                currencyCode
                __typename
            }
            __typename
        }
        __typename
        thumbnail {
            url
            alt
        }
    }

    fragment AttributeValueList on AttributeValueCountableConnection {
        pageInfo {
            ...PageInfo
            __typename
        }
        edges {
            cursor
            node {
                ...AttributeValueDetails
                __typename
            }
            __typename
        }
        __typename
    }

    fragment PageInfo on PageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
        __typename
    }

    fragment AttributeValueDetails on AttributeValue {
        ...AttributeValue
        plainText
        richText
        __typename
    }

    fragment AttributeValue on AttributeValue {
        id
        name
        slug
        file {
            ...File
            __typename
        }
        reference
        boolean
        date
        dateTime
        value
        __typename
    }

    fragment File on File {
        url
        contentType
        __typename
    }

    fragment VariantAttribute on Attribute {
        id
        name
        slug
        inputType
        entityType
        valueRequired
        unit
        choices(first: $firstValues, after: $afterValues, last: $lastValues, before: $beforeValues) {
            ...AttributeValueList
            __typename
        }
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }

    fragment ChannelListingProductWithoutPricing on ProductChannelListing {
        isPublished
        publicationDate
        isAvailableForPurchase
        availableForPurchase
        visibleInListings
        channel {
            id
            name
            currencyCode
            __typename
        }
        __typename
    }

    fragment ProductMedia on ProductMedia {
        id
        alt
        sortOrder
        url(size: 1024)
        type
        oembedData
        __typename
    }

    fragment ProductDetailsVariant on ProductVariant {
        id
        sku
        name
        attributes {
            attribute {
                id
                name
                __typename
            }
            values {
                ...AttributeValueDetails
                __typename
            }
            __typename
        }
        media {
            url(size: 200)
            __typename
        }
        stocks {
            ...Stock
            __typename
        }
        trackInventory
        preorder {
            ...Preorder
            __typename
        }
        channelListings {
            ...ChannelListingProductVariant
            __typename
        }
        quantityLimitPerCustomer
        __typename
    }

    fragment Stock on Stock {
        id
        quantity
        quantityAllocated
        warehouse {
            ...Warehouse
            __typename
        }
        __typename
    }

    fragment Warehouse on Warehouse {
        id
        name
        __typename
    }

    fragment Preorder on PreorderData {
        globalThreshold
        globalSoldUnits
        endDate
        __typename
    }

    fragment ChannelListingProductVariant on ProductVariantChannelListing {
        id
        channel {
            id
            name
            currencyCode
            __typename
        }
        price {
            ...Money
            __typename
        }
        costPrice {
            ...Money
            __typename
        }
        preorderThreshold {
            quantity
            soldUnits
            __typename
        }
        __typename
    }

    fragment Money on Money {
        amount
        currency
        __typename
    }

    fragment Weight on Weight {
        unit
        value
        __typename
    }
`;

export const PRODUCT_LIST_TAGS = gql`
    query TagList($first: Int, $last: Int, $before: String, $after: String, $search: String = "") {
        tags(first: $first, last: $last, before: $before, after: $after, search: $search) {
            edges {
                node {
                    id
                    name
                    __typename
                }
                __typename
            }
            __typename
            pageInfo {
                endCursor
                hasNextPage
                hasPreviousPage
                startCursor
            }
            totalCount
        }
    }
`;

export const ATTRIBUTE_LIST = gql`
    query AttributeList($filter: AttributeFilterInput, $before: String, $after: String, $first: Int, $last: Int, $sort: AttributeSortingInput) {
        attributes(filter: $filter, before: $before, after: $after, first: $first, last: $last, sortBy: $sort) {
            edges {
                node {
                    ...Attribute
                    __typename
                }
                __typename
            }
            pageInfo {
                ...PageInfo
                __typename
            }
            __typename
            totalCount
        }
    }

    fragment Attribute on Attribute {
        id
        name
        slug
        type
        visibleInStorefront
        filterableInDashboard
        filterableInStorefront
        unit
        inputType
        __typename
    }

    fragment PageInfo on PageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
        __typename
    }
`;

export const CREATE_ATTRIBUTE = gql`
    mutation AttributeCreate($input: AttributeCreateInput!) {
        attributeCreate(input: $input) {
            attribute {
                id
                __typename
            }
            errors {
                ...AttributeError
                __typename
            }
            __typename
        }
    }

    fragment AttributeError on AttributeError {
        code
        field
        message
        __typename
    }
`;

export const DELETE_ATTRIBUTE = gql`
    mutation AttributeDelete($id: ID!) {
        attributeDelete(id: $id) {
            errors {
                ...AttributeError
                __typename
            }
            __typename
        }
    }

    fragment AttributeError on AttributeError {
        code
        field
        message
        __typename
    }
`;

export const UPDATE_ATTRIBUTE = gql`
    mutation AttributeUpdate($id: ID!, $input: AttributeUpdateInput!) {
        attributeUpdate(id: $id, input: $input) {
            attribute {
                ...AttributeDetails
                __typename
            }
            errors {
                ...AttributeError
                __typename
            }
            __typename
        }
    }

    fragment AttributeDetails on Attribute {
        ...Attribute
        ...Metadata
        availableInGrid
        inputType
        entityType
        unit
        storefrontSearchPosition
        valueRequired
        __typename
    }

    fragment Attribute on Attribute {
        id
        name
        slug
        type
        visibleInStorefront
        filterableInDashboard
        filterableInStorefront
        unit
        inputType
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }

    fragment AttributeError on AttributeError {
        code
        field
        message
        __typename
    }
`;

export const CREATE_ATTRIBUTE_VALUE = gql`
    mutation AttributeValueCreate($id: ID!, $input: AttributeValueCreateInput!, $firstValues: Int, $afterValues: String, $lastValues: Int, $beforeValues: String) {
        attributeValueCreate(attribute: $id, input: $input) {
            attribute {
                id
                choices(first: $firstValues, after: $afterValues, last: $lastValues, before: $beforeValues) {
                    ...AttributeValueList
                    __typename
                }
                __typename
            }
            errors {
                ...AttributeError
                __typename
            }
            __typename
        }
    }

    fragment AttributeValueList on AttributeValueCountableConnection {
        pageInfo {
            ...PageInfo
            __typename
        }
        edges {
            cursor
            node {
                ...AttributeValueDetails
                __typename
            }
            __typename
        }
        __typename
    }

    fragment PageInfo on PageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
        __typename
    }

    fragment AttributeValueDetails on AttributeValue {
        ...AttributeValue
        plainText
        richText
        __typename
    }

    fragment AttributeValue on AttributeValue {
        id
        name
        slug
        file {
            ...File
            __typename
        }
        reference
        boolean
        date
        dateTime
        value
        __typename
    }

    fragment File on File {
        url
        contentType
        __typename
    }

    fragment AttributeError on AttributeError {
        code
        field
        message
        __typename
    }
`;

export const DELETE_ATTRIBUTE_VALUE = gql`
    mutation AttributeValueDelete($id: ID!, $firstValues: Int, $afterValues: String, $lastValues: Int, $beforeValues: String) {
        attributeValueDelete(id: $id) {
            attribute {
                id
                choices(first: $firstValues, after: $afterValues, last: $lastValues, before: $beforeValues) {
                    ...AttributeValueList
                    __typename
                }
                __typename
            }
            errors {
                ...AttributeError
                __typename
            }
            __typename
        }
    }

    fragment AttributeValueList on AttributeValueCountableConnection {
        pageInfo {
            ...PageInfo
            __typename
        }
        edges {
            cursor
            node {
                ...AttributeValueDetails
                __typename
            }
            __typename
        }
        __typename
    }

    fragment PageInfo on PageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
        __typename
    }

    fragment AttributeValueDetails on AttributeValue {
        ...AttributeValue
        plainText
        richText
        __typename
    }

    fragment AttributeValue on AttributeValue {
        id
        name
        slug
        file {
            ...File
            __typename
        }
        reference
        boolean
        date
        dateTime
        value
        __typename
    }

    fragment File on File {
        url
        contentType
        __typename
    }

    fragment AttributeError on AttributeError {
        code
        field
        message
        __typename
    }
`;

export const ATTRIBUTE_DETAILS = gql`
    query AttributeDetails($id: ID!, $firstValues: Int, $afterValues: String, $lastValues: Int, $beforeValues: String) {
        attribute(id: $id) {
            ...AttributeDetails
            choices(first: $firstValues, after: $afterValues, last: $lastValues, before: $beforeValues) {
                ...AttributeValueList
                __typename
            }
            __typename
        }
    }

    fragment AttributeDetails on Attribute {
        ...Attribute
        ...Metadata
        availableInGrid
        inputType
        entityType
        unit
        storefrontSearchPosition
        valueRequired
        __typename
    }

    fragment Attribute on Attribute {
        id
        name
        slug
        type
        visibleInStorefront
        filterableInDashboard
        filterableInStorefront
        unit
        inputType
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }

    fragment AttributeValueList on AttributeValueCountableConnection {
        pageInfo {
            ...PageInfo
            __typename
        }
        edges {
            cursor
            node {
                ...AttributeValueDetails
                __typename
            }
            __typename
        }
        __typename
    }

    fragment PageInfo on PageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
        __typename
    }

    fragment AttributeValueDetails on AttributeValue {
        ...AttributeValue
        plainText
        richText
        __typename
    }

    fragment AttributeValue on AttributeValue {
        id
        name
        slug
        file {
            ...File
            __typename
        }
        reference
        boolean
        date
        dateTime
        value
        __typename
    }

    fragment File on File {
        url
        contentType
        __typename
    }
`;

export const CUSTOMER_UPDATE_ADDRESS = gql`
    mutation UpdateCustomerAddress($id: ID!, $input: AddressInput!) {
        addressUpdate(id: $id, input: $input) {
            errors {
                ...AccountError
                __typename
            }
            address {
                ...Address
                __typename
            }
            __typename
        }
    }

    fragment AccountError on AccountError {
        code
        field
        addressType
        message
        __typename
    }

    fragment Address on Address {
        city
        cityArea
        companyName
        country {
            __typename
            code
            country
        }
        countryArea
        firstName
        id
        lastName
        phone
        postalCode
        streetAddress1
        streetAddress2
        __typename
    }
`;

export const SEND_INVOICE = gql`
    mutation InvoiceEmailSend($id: ID!) {
        invoiceSendNotification(id: $id) {
            errors {
                ...InvoiceError
                __typename
            }
            invoice {
                ...Invoice
                __typename
            }
            __typename
        }
    }

    fragment InvoiceError on InvoiceError {
        code
        field
        message
        __typename
    }

    fragment Invoice on Invoice {
        id
        number
        createdAt
        url
        status
        __typename
    }
`;

export const ASSIGN_TAG_PRODUCT = gql`
    mutation UpdateProduct($id: ID!, $input: ProductInput!) {
        productUpdate(id: $id, input: $input) {
            product {
                id
                name
                description
                tags {
                    name
                }
            }
        }
    }
`;

export const CREATE_CUSTOMER_ADDRESS = gql`
    mutation CreateCustomerAddress($id: ID!, $input: AddressInput!) {
        addressCreate(userId: $id, input: $input) {
            errors {
                ...AccountError
                __typename
            }
            address {
                ...Address
                __typename
            }
            user {
                ...CustomerAddresses
                __typename
            }
            __typename
        }
    }

    fragment AccountError on AccountError {
        code
        field
        addressType
        message
        __typename
    }

    fragment Address on Address {
        city
        cityArea
        companyName
        country {
            __typename
            code
            country
        }
        countryArea
        firstName
        id
        lastName
        phone
        postalCode
        streetAddress1
        streetAddress2
        __typename
    }

    fragment CustomerAddresses on User {
        ...Customer
        addresses {
            ...Address
            __typename
        }
        defaultBillingAddress {
            id
            __typename
        }
        defaultShippingAddress {
            id
            __typename
        }
        __typename
    }

    fragment Customer on User {
        id
        email
        firstName
        lastName
        __typename
    }
`;

export const PRODUCT_SEARCH = gql`
    query ProductSearchbyName($query: String!, $channel: String!, $first: Int, $after: String = "") {
        products(first: $first, channel: $channel, search: $query, sortBy: { direction: DESC, field: NAME }, after: $after) {
            edges {
                node {
                    id
                    name
                    defaultVariant {
                        id
                        name
                        __typename
                    }
                    thumbnail {
                        url
                        __typename
                    }
                    pricing {
                        priceRange {
                            start {
                                gross {
                                    amount
                                    __typename
                                }
                                __typename
                            }
                            stop {
                                gross {
                                    amount
                                    __typename
                                }
                                __typename
                            }
                            __typename
                        }
                        __typename
                    }
                    variants {
                        id
                        images {
                            url
                            id
                            __typename
                        }
                        name
                        __typename
                        costPrice
                        pricing {
                            price {
                                gross {
                                    amount
                                    currency
                                }
                            }
                        }
                    }
                    __typename
                }
                __typename
            }
            __typename
            pageInfo {
                endCursor
                hasNextPage
                hasPreviousPage
                startCursor
            }
            totalCount
        }
    }
`;

export const FILTER_PRODUCT_LIST = gql`
    query SearchOrderVariant($channel: String!, $first: Int!, $query: String!, $after: String, $address: AddressInput, $isPublished: Boolean, $stockAvailability: StockAvailability) {
        search: products(first: $first, after: $after, filter: { search: $query, isPublished: $isPublished, stockAvailability: $stockAvailability }, channel: $channel) {
            edges {
                node {
                    id
                    name
                    thumbnail {
                        url
                        __typename
                    }
                    variants {
                        id
                        name
                        sku
                        pricing(address: $address) {
                            priceUndiscounted {
                                gross {
                                    ...Money
                                    __typename
                                }
                                __typename
                            }
                            price {
                                gross {
                                    ...Money
                                    __typename
                                }
                                __typename
                            }
                            onSale
                            __typename
                        }
                        __typename
                    }
                    __typename
                }
                __typename
            }
            pageInfo {
                endCursor
                hasNextPage
                hasPreviousPage
                startCursor
                __typename
            }
            __typename
        }
    }

    fragment Money on Money {
        amount
        currency
        __typename
    }
`;

export const REMOVE_IMAGE = gql`
    mutation ProductMediaDelete($id: ID!) {
        productMediaDelete(id: $id) {
            errors {
                ...ProductError
                __typename
            }
            product {
                id
                media {
                    id
                    __typename
                    url
                    type
                    oembedData
                }
                __typename
            }
            __typename
        }
    }

    fragment ProductError on ProductError {
        code
        field
        message
        __typename
    }
`;

export const UPDATE_PRODUCT = gql`
    mutation ProductUpdate($id: ID!, $input: ProductInput!) {
        productUpdate(id: $id, input: $input) {
            errors {
                ...ProductErrorWithAttributes
                __typename
            }
            __typename
        }
    }

    fragment ProductErrorWithAttributes on ProductError {
        ...ProductError
        attributes
        __typename
    }

    fragment ProductError on ProductError {
        code
        field
        message
        __typename
    }
`;

export const DELETE_VARIENT = gql`
    mutation VariantDelete($id: ID!) {
        productVariantDelete(id: $id) {
            errors {
                ...ProductError
                __typename
            }
            productVariant {
                id
                __typename
            }
            __typename
        }
    }

    fragment ProductError on ProductError {
        code
        field
        message
        __typename
    }
`;

export const DELETE_PRODUCTS = gql`
    mutation productBulkDelete($ids: [ID!]!) {
        productBulkDelete(ids: $ids) {
            errors {
                ...ProductError
                __typename
            }
            __typename
        }
    }

    fragment ProductError on ProductError {
        code
        field
        message
        __typename
    }
`;

export const DELETE_CUSTOMER = gql`
    mutation BulkRemoveCustomers($ids: [ID!]!) {
        customerBulkDelete(ids: $ids) {
            errors {
                ...AccountError
                __typename
            }
            __typename
        }
    }

    fragment AccountError on AccountError {
        code
        field
        addressType
        message
        __typename
    }
`;

export const DELETE_CUSTOMER_ADDRESS = gql`
    mutation RemoveCustomerAddress($id: ID!) {
        addressDelete(id: $id) {
            errors {
                ...AccountError
                __typename
            }
            user {
                ...CustomerAddresses
                __typename
            }
            __typename
        }
    }

    fragment AccountError on AccountError {
        code
        field
        addressType
        message
        __typename
    }

    fragment CustomerAddresses on User {
        ...Customer
        addresses {
            ...Address
            __typename
        }
        defaultBillingAddress {
            id
            __typename
        }
        defaultShippingAddress {
            id
            __typename
        }
        __typename
    }

    fragment Customer on User {
        id
        email
        firstName
        lastName
        __typename
    }

    fragment Address on Address {
        city
        cityArea
        companyName
        country {
            __typename
            code
            country
        }
        countryArea
        firstName
        id
        lastName
        phone
        postalCode
        streetAddress1
        streetAddress2
        __typename
    }
`;

export const SET_DEFAULT_ADDRESS = gql`
    mutation SetCustomerDefaultAddress($addressId: ID!, $userId: ID!, $type: AddressTypeEnum!) {
        addressSetDefault(addressId: $addressId, userId: $userId, type: $type) {
            errors {
                ...AccountError
                __typename
            }
            user {
                ...CustomerAddresses
                __typename
            }
            __typename
        }
    }

    fragment AccountError on AccountError {
        code
        field
        addressType
        message
        __typename
    }

    fragment CustomerAddresses on User {
        ...Customer
        addresses {
            ...Address
            __typename
        }
        defaultBillingAddress {
            id
            __typename
        }
        defaultShippingAddress {
            id
            __typename
        }
        __typename
    }

    fragment Customer on User {
        id
        email
        firstName
        lastName
        __typename
    }

    fragment Address on Address {
        city
        cityArea
        companyName
        country {
            __typename
            code
            country
        }
        countryArea
        firstName
        id
        lastName
        phone
        postalCode
        streetAddress1
        streetAddress2
        __typename
    }
`;

export const PRODUCTS_MEDIA_ORDERS = gql`
    mutation ProductMediaReorder($productId: ID!, $mediaIds: [ID!]!) {
        productMediaReorder(productId: $productId, mediaIds: $mediaIds) {
            errors {
                ...ProductError
                __typename
            }
            product {
                id
                media {
                    id
                    alt
                    sortOrder
                    url
                    __typename
                }
                __typename
            }
            __typename
        }
    }

    fragment ProductError on ProductError {
        code
        field
        message
        __typename
    }
`;

export const ORDER_DISCOUNT_UPDATE = gql`
    mutation OrderDiscountUpdate($input: OrderDiscountCommonInput!, $discountId: ID!) {
        orderDiscountUpdate(input: $input, discountId: $discountId) {
            errors {
                ...OrderError
                __typename
            }
            order {
                ...OrderDetails
                __typename
            }
            __typename
        }
    }

    fragment OrderError on OrderError {
        code
        field
        addressType
        message
        orderLines
        __typename
    }

    fragment OrderDetails on Order {
        id
        token
        ...Metadata
        billingAddress {
            ...Address
            __typename
        }
        transactions {
            ...TransactionItem
            __typename
        }
        payments {
            ...OrderPayment
            __typename
        }
        giftCards {
            ...OrderGiftCard
            __typename
        }
        grantedRefunds {
            ...OrderGrantedRefund
            __typename
        }
        isShippingRequired
        canFinalize
        created
        customerNote
        discounts {
            id
            type
            calculationMode: valueType
            value
            reason
            amount {
                ...Money
                __typename
            }
            __typename
        }
        events {
            ...OrderEvent
            __typename
        }
        fulfillments {
            ...Fulfillment
            __typename
        }
        lines {
            ...OrderLine
            __typename
        }
        number
        isPaid
        paymentStatus
        shippingAddress {
            ...Address
            __typename
        }
        deliveryMethod {
            __typename
            ... on ShippingMethod {
                id
                __typename
            }
            ... on Warehouse {
                id
                clickAndCollectOption
                __typename
            }
        }
        shippingMethod {
            id
            __typename
        }
        shippingMethodName
        collectionPointName
        shippingPrice {
            gross {
                amount
                currency
                __typename
            }
            __typename
        }
        status
        subtotal {
            gross {
                ...Money
                __typename
            }
            net {
                ...Money
                __typename
            }
            __typename
        }
        total {
            gross {
                ...Money
                __typename
            }
            net {
                ...Money
                __typename
            }
            tax {
                ...Money
                __typename
            }
            __typename
        }
        totalRemainingGrant {
            ...Money
            __typename
        }
        totalGrantedRefund {
            ...Money
            __typename
        }
        totalRefundPending {
            ...Money
            __typename
        }
        totalRefunded {
            ...Money
            __typename
        }
        actions
        totalAuthorizePending {
            ...Money
            __typename
        }
        totalAuthorized {
            ...Money
            __typename
        }
        totalCaptured {
            ...Money
            __typename
        }
        totalCharged {
            ...Money
            __typename
        }
        totalChargePending {
            ...Money
            __typename
        }
        totalCanceled {
            ...Money
            __typename
        }
        totalCancelPending {
            ...Money
            __typename
        }
        totalBalance {
            ...Money
            __typename
        }
        undiscountedTotal {
            net {
                ...Money
                __typename
            }
            gross {
                ...Money
                __typename
            }
            __typename
        }
        user {
            id
            email
            __typename
        }
        userEmail
        shippingMethods {
            id
            name
            price {
                ...Money
                __typename
            }
            active
            message
            __typename
        }
        invoices {
            ...Invoice
            __typename
        }
        channel {
            isActive
            id
            name
            currencyCode
            slug
            defaultCountry {
                code
                __typename
            }
            orderSettings {
                markAsPaidStrategy
                __typename
            }
            __typename
        }
        isPaid
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }

    fragment Address on Address {
        city
        cityArea
        companyName
        country {
            __typename
            code
            country
        }
        countryArea
        firstName
        id
        lastName
        phone
        postalCode
        streetAddress1
        streetAddress2
        __typename
    }

    fragment TransactionItem on TransactionItem {
        id
        pspReference
        actions
        name
        externalUrl
        events {
            ...TransactionEvent
            __typename
        }
        authorizedAmount {
            ...Money
            __typename
        }
        chargedAmount {
            ...Money
            __typename
        }
        refundedAmount {
            ...Money
            __typename
        }
        canceledAmount {
            ...Money
            __typename
        }
        authorizePendingAmount {
            ...Money
            __typename
        }
        chargePendingAmount {
            ...Money
            __typename
        }
        refundPendingAmount {
            ...Money
            __typename
        }
        cancelPendingAmount {
            ...Money
            __typename
        }
        __typename
    }

    fragment TransactionEvent on TransactionEvent {
        id
        pspReference
        amount {
            ...Money
            __typename
        }
        type
        message
        createdAt
        createdBy {
            ... on User {
                ...StaffMemberAvatar
                __typename
            }
            ... on App {
                ...AppAvatar
                __typename
            }
            __typename
        }
        externalUrl
        __typename
    }

    fragment Money on Money {
        amount
        currency
        __typename
    }

    fragment StaffMemberAvatar on User {
        ...StaffMember
        avatar(size: 512) {
            url
            __typename
        }
        __typename
    }

    fragment StaffMember on User {
        id
        email
        firstName
        isActive
        lastName
        __typename
    }

    fragment AppAvatar on App {
        id
        name
        __typename
    }

    fragment OrderPayment on Payment {
        id
        isActive
        actions
        gateway
        paymentMethodType
        availableCaptureAmount {
            ...Money
            __typename
        }
        capturedAmount {
            ...Money
            __typename
        }
        total {
            ...Money
            __typename
        }
        availableRefundAmount {
            ...Money
            __typename
        }
        modified
        transactions {
            id
            token
            created
            kind
            isSuccess
            __typename
        }
        __typename
    }

    fragment OrderGiftCard on GiftCard {
        id
        last4CodeChars
        events {
            id
            type
            orderId
            date
            balance {
                initialBalance {
                    ...Money
                    __typename
                }
                currentBalance {
                    ...Money
                    __typename
                }
                oldInitialBalance {
                    ...Money
                    __typename
                }
                oldCurrentBalance {
                    ...Money
                    __typename
                }
                __typename
            }
            __typename
        }
        __typename
    }

    fragment OrderGrantedRefund on OrderGrantedRefund {
        id
        createdAt
        shippingCostsIncluded
        amount {
            currency
            amount
            __typename
        }
        reason
        user {
            ...UserBaseAvatar
            __typename
        }
        app {
            id
            name
            __typename
        }
        __typename
    }

    fragment UserBaseAvatar on User {
        id
        firstName
        lastName
        email
        avatar {
            url
            alt
            __typename
        }
        __typename
    }

    fragment OrderEvent on OrderEvent {
        id
        amount
        shippingCostsIncluded
        date
        email
        emailType
        invoiceNumber
        discount {
            valueType
            value
            reason
            amount {
                amount
                currency
                __typename
            }
            oldValueType
            oldValue
            oldAmount {
                amount
                currency
                __typename
            }
            __typename
        }
        relatedOrder {
            id
            number
            __typename
        }
        message
        quantity
        transactionReference
        type
        user {
            id
            email
            firstName
            lastName
            __typename
        }
        app {
            id
            name
            appUrl
            __typename
        }
        lines {
            quantity
            itemName
            discount {
                valueType
                value
                reason
                amount {
                    amount
                    currency
                    __typename
                }
                oldValueType
                oldValue
                oldAmount {
                    amount
                    currency
                    __typename
                }
                __typename
            }
            orderLine {
                id
                productName
                variantName
                __typename
            }
            __typename
        }
        __typename
    }

    fragment Fulfillment on Fulfillment {
        ...Metadata
        id
        lines {
            id
            quantity
            orderLine {
                ...OrderLine
                __typename
            }
            __typename
        }
        fulfillmentOrder
        status
        trackingNumber
        warehouse {
            id
            name
            __typename
        }
        __typename
    }

    fragment OrderLine on OrderLine {
        id
        isShippingRequired
        allocations {
            id
            quantity
            warehouse {
                id
                name
                __typename
            }
            __typename
        }
        variant {
            id
            name
            quantityAvailable
            preorder {
                endDate
                __typename
            }
            stocks {
                ...Stock
                __typename
            }
            product {
                id
                isAvailableForPurchase
                __typename
            }
            __typename
        }
        productName
        productSku
        quantity
        quantityFulfilled
        quantityToFulfill
        totalPrice {
            ...TaxedMoney
            __typename
        }
        unitDiscount {
            amount
            currency
            __typename
        }
        unitDiscountValue
        unitDiscountReason
        unitDiscountType
        undiscountedUnitPrice {
            currency
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        unitPrice {
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        thumbnail {
            url
            __typename
        }
        __typename
    }

    fragment Stock on Stock {
        id
        quantity
        quantityAllocated
        warehouse {
            ...Warehouse
            __typename
        }
        __typename
    }

    fragment Warehouse on Warehouse {
        id
        name
        __typename
    }

    fragment TaxedMoney on TaxedMoney {
        net {
            ...Money
            __typename
        }
        gross {
            ...Money
            __typename
        }
        __typename
    }

    fragment Invoice on Invoice {
        id
        number
        createdAt
        url
        status
        __typename
    }
`;

export const SHIPPING_COST_UPDATE = gql`
    mutation OrderShippingMethodUpdate($id: ID!, $input: OrderUpdateShippingInput!) {
        orderUpdateShipping(order: $id, input: $input) {
            errors {
                ...OrderError
                __typename
            }
            order {
                shippingMethods {
                    id
                    name
                    __typename
                }
                total {
                    tax {
                        amount
                        currency
                        __typename
                    }
                    gross {
                        amount
                        currency
                        __typename
                    }
                    __typename
                }
                id
                shippingMethod {
                    id
                    name
                    price {
                        amount
                        currency
                        __typename
                    }
                    __typename
                }
                shippingMethodName
                shippingPrice {
                    gross {
                        amount
                        currency
                        __typename
                    }
                    __typename
                }
                ...OrderDetails
                __typename
            }
            __typename
        }
    }

    fragment OrderError on OrderError {
        code
        field
        addressType
        message
        orderLines
        __typename
    }

    fragment OrderDetails on Order {
        id
        token
        ...Metadata
        billingAddress {
            ...Address
            __typename
        }
        transactions {
            ...TransactionItem
            __typename
        }
        payments {
            ...OrderPayment
            __typename
        }
        giftCards {
            ...OrderGiftCard
            __typename
        }
        grantedRefunds {
            ...OrderGrantedRefund
            __typename
        }
        isShippingRequired
        canFinalize
        created
        customerNote
        discounts {
            id
            type
            calculationMode: valueType
            value
            reason
            amount {
                ...Money
                __typename
            }
            __typename
        }
        events {
            ...OrderEvent
            __typename
        }
        fulfillments {
            ...Fulfillment
            __typename
        }
        lines {
            ...OrderLine
            __typename
        }
        number
        isPaid
        paymentStatus
        shippingAddress {
            ...Address
            __typename
        }
        deliveryMethod {
            __typename
            ... on ShippingMethod {
                id
                __typename
            }
            ... on Warehouse {
                id
                clickAndCollectOption
                __typename
            }
        }
        shippingMethod {
            id
            __typename
        }
        shippingMethodName
        collectionPointName
        shippingPrice {
            gross {
                amount
                currency
                __typename
            }
            __typename
        }
        status
        subtotal {
            gross {
                ...Money
                __typename
            }
            net {
                ...Money
                __typename
            }
            __typename
        }
        total {
            gross {
                ...Money
                __typename
            }
            net {
                ...Money
                __typename
            }
            tax {
                ...Money
                __typename
            }
            __typename
        }
        totalRemainingGrant {
            ...Money
            __typename
        }
        totalGrantedRefund {
            ...Money
            __typename
        }
        totalRefundPending {
            ...Money
            __typename
        }
        totalRefunded {
            ...Money
            __typename
        }
        actions
        totalAuthorizePending {
            ...Money
            __typename
        }
        totalAuthorized {
            ...Money
            __typename
        }
        totalCaptured {
            ...Money
            __typename
        }
        totalCharged {
            ...Money
            __typename
        }
        totalChargePending {
            ...Money
            __typename
        }
        totalCanceled {
            ...Money
            __typename
        }
        totalCancelPending {
            ...Money
            __typename
        }
        totalBalance {
            ...Money
            __typename
        }
        undiscountedTotal {
            net {
                ...Money
                __typename
            }
            gross {
                ...Money
                __typename
            }
            __typename
        }
        user {
            id
            email
            __typename
        }
        userEmail
        shippingMethods {
            id
            name
            price {
                ...Money
                __typename
            }
            active
            message
            __typename
        }
        invoices {
            ...Invoice
            __typename
        }
        channel {
            isActive
            id
            name
            currencyCode
            slug
            defaultCountry {
                code
                __typename
            }
            orderSettings {
                markAsPaidStrategy
                __typename
            }
            __typename
        }
        isPaid
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }

    fragment Address on Address {
        city
        cityArea
        companyName
        country {
            __typename
            code
            country
        }
        countryArea
        firstName
        id
        lastName
        phone
        postalCode
        streetAddress1
        streetAddress2
        __typename
    }

    fragment TransactionItem on TransactionItem {
        id
        pspReference
        actions
        name
        externalUrl
        events {
            ...TransactionEvent
            __typename
        }
        authorizedAmount {
            ...Money
            __typename
        }
        chargedAmount {
            ...Money
            __typename
        }
        refundedAmount {
            ...Money
            __typename
        }
        canceledAmount {
            ...Money
            __typename
        }
        authorizePendingAmount {
            ...Money
            __typename
        }
        chargePendingAmount {
            ...Money
            __typename
        }
        refundPendingAmount {
            ...Money
            __typename
        }
        cancelPendingAmount {
            ...Money
            __typename
        }
        __typename
    }

    fragment TransactionEvent on TransactionEvent {
        id
        pspReference
        amount {
            ...Money
            __typename
        }
        type
        message
        createdAt
        createdBy {
            ... on User {
                ...StaffMemberAvatar
                __typename
            }
            ... on App {
                ...AppAvatar
                __typename
            }
            __typename
        }
        externalUrl
        __typename
    }

    fragment Money on Money {
        amount
        currency
        __typename
    }

    fragment StaffMemberAvatar on User {
        ...StaffMember
        avatar(size: 512) {
            url
            __typename
        }
        __typename
    }

    fragment StaffMember on User {
        id
        email
        firstName
        isActive
        lastName
        __typename
    }

    fragment AppAvatar on App {
        id
        name
        __typename
    }

    fragment OrderPayment on Payment {
        id
        isActive
        actions
        gateway
        paymentMethodType
        availableCaptureAmount {
            ...Money
            __typename
        }
        capturedAmount {
            ...Money
            __typename
        }
        total {
            ...Money
            __typename
        }
        availableRefundAmount {
            ...Money
            __typename
        }
        modified
        transactions {
            id
            token
            created
            kind
            isSuccess
            __typename
        }
        __typename
    }

    fragment OrderGiftCard on GiftCard {
        id
        last4CodeChars
        events {
            id
            type
            orderId
            date
            balance {
                initialBalance {
                    ...Money
                    __typename
                }
                currentBalance {
                    ...Money
                    __typename
                }
                oldInitialBalance {
                    ...Money
                    __typename
                }
                oldCurrentBalance {
                    ...Money
                    __typename
                }
                __typename
            }
            __typename
        }
        __typename
    }

    fragment OrderGrantedRefund on OrderGrantedRefund {
        id
        createdAt
        shippingCostsIncluded
        amount {
            currency
            amount
            __typename
        }
        reason
        user {
            ...UserBaseAvatar
            __typename
        }
        app {
            id
            name
            __typename
        }
        __typename
    }

    fragment UserBaseAvatar on User {
        id
        firstName
        lastName
        email
        avatar {
            url
            alt
            __typename
        }
        __typename
    }

    fragment OrderEvent on OrderEvent {
        id
        amount
        shippingCostsIncluded
        date
        email
        emailType
        invoiceNumber
        discount {
            valueType
            value
            reason
            amount {
                amount
                currency
                __typename
            }
            oldValueType
            oldValue
            oldAmount {
                amount
                currency
                __typename
            }
            __typename
        }
        relatedOrder {
            id
            number
            __typename
        }
        message
        quantity
        transactionReference
        type
        user {
            id
            email
            firstName
            lastName
            __typename
        }
        app {
            id
            name
            appUrl
            __typename
        }
        lines {
            quantity
            itemName
            discount {
                valueType
                value
                reason
                amount {
                    amount
                    currency
                    __typename
                }
                oldValueType
                oldValue
                oldAmount {
                    amount
                    currency
                    __typename
                }
                __typename
            }
            orderLine {
                id
                productName
                variantName
                __typename
            }
            __typename
        }
        __typename
    }

    fragment Fulfillment on Fulfillment {
        ...Metadata
        id
        lines {
            id
            quantity
            orderLine {
                ...OrderLine
                __typename
            }
            __typename
        }
        fulfillmentOrder
        status
        trackingNumber
        warehouse {
            id
            name
            __typename
        }
        __typename
    }

    fragment OrderLine on OrderLine {
        id
        isShippingRequired
        allocations {
            id
            quantity
            warehouse {
                id
                name
                __typename
            }
            __typename
        }
        variant {
            id
            name
            quantityAvailable
            preorder {
                endDate
                __typename
            }
            stocks {
                ...Stock
                __typename
            }
            product {
                id
                isAvailableForPurchase
                __typename
            }
            __typename
        }
        productName
        productSku
        quantity
        quantityFulfilled
        quantityToFulfill
        totalPrice {
            ...TaxedMoney
            __typename
        }
        unitDiscount {
            amount
            currency
            __typename
        }
        unitDiscountValue
        unitDiscountReason
        unitDiscountType
        undiscountedUnitPrice {
            currency
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        unitPrice {
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        thumbnail {
            url
            __typename
        }
        __typename
    }

    fragment Stock on Stock {
        id
        quantity
        quantityAllocated
        warehouse {
            ...Warehouse
            __typename
        }
        __typename
    }

    fragment Warehouse on Warehouse {
        id
        name
        __typename
    }

    fragment TaxedMoney on TaxedMoney {
        net {
            ...Money
            __typename
        }
        gross {
            ...Money
            __typename
        }
        __typename
    }

    fragment Invoice on Invoice {
        id
        number
        createdAt
        url
        status
        __typename
    }
`;

export const CUSTOMER_ADDRESS = gql`
    query CustomerAddresses($id: ID!) {
        user(id: $id) {
            ...CustomerAddresses
            __typename
        }
    }

    fragment CustomerAddresses on User {
        ...Customer
        addresses {
            ...Address
            __typename
        }
        defaultBillingAddress {
            id
            __typename
            city
            country {
                country
            }
            countryArea
            lastName
            firstName
            phone
            streetAddress1
            streetAddress2
            postalCode
            __typename
        }
        defaultShippingAddress {
            id
            __typename
            city
            country {
                country
            }
            countryArea
            lastName
            firstName
            phone
            streetAddress1
            streetAddress2
            postalCode
        }
        __typename
    }

    fragment Customer on User {
        id
        email
        firstName
        lastName
        __typename
    }

    fragment Address on Address {
        city
        cityArea
        companyName
        country {
            __typename
            code
            country
        }
        countryArea
        firstName
        id
        lastName
        phone
        postalCode
        streetAddress1
        streetAddress2
        __typename
    }
`;

export const ADD_NEW_LINE = gql`
    mutation OrderLinesAdd($id: ID!, $input: [OrderLineCreateInput!]!) {
        orderLinesCreate(id: $id, input: $input) {
            errors {
                ...OrderError
                __typename
            }
            order {
                id
                lines {
                    ...OrderLine
                    __typename
                }
                __typename
            }
            __typename
        }
    }

    fragment OrderError on OrderError {
        code
        field
        addressType
        message
        orderLines
        __typename
    }

    fragment OrderLine on OrderLine {
        id
        isShippingRequired
        allocations {
            id
            quantity
            warehouse {
                id
                name
                __typename
            }
            __typename
        }
        variant {
            id
            name
            quantityAvailable
            preorder {
                endDate
                __typename
            }
            stocks {
                ...Stock
                __typename
            }
            product {
                id
                isAvailableForPurchase
                __typename
            }
            __typename
        }
        productName
        productSku
        quantity
        quantityFulfilled
        quantityToFulfill
        totalPrice {
            ...TaxedMoney
            __typename
        }
        unitDiscount {
            amount
            currency
            __typename
        }
        unitDiscountValue
        unitDiscountReason
        unitDiscountType
        undiscountedUnitPrice {
            currency
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        unitPrice {
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        thumbnail {
            url
            __typename
        }
        __typename
    }

    fragment Stock on Stock {
        id
        quantity
        quantityAllocated
        warehouse {
            ...Warehouse
            __typename
        }
        __typename
    }

    fragment Warehouse on Warehouse {
        id
        name
        __typename
    }

    fragment TaxedMoney on TaxedMoney {
        net {
            ...Money
            __typename
        }
        gross {
            ...Money
            __typename
        }
        __typename
    }

    fragment Money on Money {
        amount
        currency
        __typename
    }
`;

export const DELETE_LINE = gql`
    mutation OrderLineDelete($id: ID!) {
        orderLineDelete(id: $id) {
            errors {
                ...OrderError
                __typename
            }
            order {
                id
                lines {
                    ...OrderLine
                    __typename
                }
                __typename
            }
            __typename
        }
    }

    fragment OrderError on OrderError {
        code
        field
        addressType
        message
        orderLines
        __typename
    }

    fragment OrderLine on OrderLine {
        id
        isShippingRequired
        allocations {
            id
            quantity
            warehouse {
                id
                name
                __typename
            }
            __typename
        }
        variant {
            id
            name
            quantityAvailable
            preorder {
                endDate
                __typename
            }
            stocks {
                ...Stock
                __typename
            }
            product {
                id
                isAvailableForPurchase
                __typename
            }
            __typename
        }
        productName
        productSku
        quantity
        quantityFulfilled
        quantityToFulfill
        totalPrice {
            ...TaxedMoney
            __typename
        }
        unitDiscount {
            amount
            currency
            __typename
        }
        unitDiscountValue
        unitDiscountReason
        unitDiscountType
        undiscountedUnitPrice {
            currency
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        unitPrice {
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        thumbnail {
            url
            __typename
        }
        __typename
    }

    fragment Stock on Stock {
        id
        quantity
        quantityAllocated
        warehouse {
            ...Warehouse
            __typename
        }
        __typename
    }

    fragment Warehouse on Warehouse {
        id
        name
        __typename
    }

    fragment TaxedMoney on TaxedMoney {
        net {
            ...Money
            __typename
        }
        gross {
            ...Money
            __typename
        }
        __typename
    }

    fragment Money on Money {
        amount
        currency
        __typename
    }
`;

export const UPDATE_LINE = gql`
    mutation OrderLineUpdate($id: ID!, $input: OrderLineInput!) {
        orderLineUpdate(id: $id, input: $input) {
            errors {
                ...OrderError
                __typename
            }
            orderLine {
                ...OrderLine
                __typename
            }
            __typename
        }
    }

    fragment OrderError on OrderError {
        code
        field
        addressType
        message
        orderLines
        __typename
    }

    fragment OrderLine on OrderLine {
        id
        isShippingRequired
        allocations {
            id
            quantity
            warehouse {
                id
                name
                __typename
            }
            __typename
        }
        variant {
            id
            name
            quantityAvailable
            preorder {
                endDate
                __typename
            }
            stocks {
                ...Stock
                __typename
            }
            product {
                id
                isAvailableForPurchase
                __typename
            }
            __typename
        }
        productName
        productSku
        quantity
        quantityFulfilled
        quantityToFulfill
        totalPrice {
            ...TaxedMoney
            __typename
        }
        unitDiscount {
            amount
            currency
            __typename
        }
        unitDiscountValue
        unitDiscountReason
        unitDiscountType
        undiscountedUnitPrice {
            currency
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        unitPrice {
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        thumbnail {
            url
            __typename
        }
        __typename
    }

    fragment Stock on Stock {
        id
        quantity
        quantityAllocated
        warehouse {
            ...Warehouse
            __typename
        }
        __typename
    }

    fragment Warehouse on Warehouse {
        id
        name
        __typename
    }

    fragment TaxedMoney on TaxedMoney {
        net {
            ...Money
            __typename
        }
        gross {
            ...Money
            __typename
        }
        __typename
    }

    fragment Money on Money {
        amount
        currency
        __typename
    }
`;

export const CREATE_DRAFT_ORDER = gql`
    mutation OrderDraftCreate($input: DraftOrderCreateInput!) {
        draftOrderCreate(input: $input) {
            errors {
                ...OrderError
                __typename
            }
            order {
                id
                __typename
            }
            __typename
        }
    }

    fragment OrderError on OrderError {
        code
        field
        addressType
        message
        orderLines
        __typename
    }
`;

export const UPDATE_DRAFT_ORDER = gql`
    mutation OrderDraftUpdate($id: ID!, $input: DraftOrderInput!) {
        draftOrderUpdate(id: $id, input: $input) {
            errors {
                ...OrderError
                __typename
            }
            order {
                ...OrderDetails
                __typename
            }
            __typename
        }
    }

    fragment OrderError on OrderError {
        code
        field
        addressType
        message
        orderLines
        __typename
    }

    fragment OrderDetails on Order {
        id
        token
        ...Metadata
        billingAddress {
            ...Address
            __typename
        }
        transactions {
            ...TransactionItem
            __typename
        }
        payments {
            ...OrderPayment
            __typename
        }
        giftCards {
            ...OrderGiftCard
            __typename
        }
        grantedRefunds {
            ...OrderGrantedRefund
            __typename
        }
        isShippingRequired
        canFinalize
        created
        customerNote
        discounts {
            id
            type
            calculationMode: valueType
            value
            reason
            amount {
                ...Money
                __typename
            }
            __typename
        }
        events {
            ...OrderEvent
            __typename
        }
        fulfillments {
            ...Fulfillment
            __typename
        }
        lines {
            ...OrderLine
            __typename
        }
        number
        isPaid
        paymentStatus
        shippingAddress {
            ...Address
            __typename
        }
        deliveryMethod {
            __typename
            ... on ShippingMethod {
                id
                __typename
            }
            ... on Warehouse {
                id
                clickAndCollectOption
                __typename
            }
        }
        shippingMethod {
            id
            __typename
        }
        shippingMethodName
        collectionPointName
        shippingPrice {
            gross {
                amount
                currency
                __typename
            }
            __typename
        }
        status
        subtotal {
            gross {
                ...Money
                __typename
            }
            net {
                ...Money
                __typename
            }
            __typename
        }
        total {
            gross {
                ...Money
                __typename
            }
            net {
                ...Money
                __typename
            }
            tax {
                ...Money
                __typename
            }
            __typename
        }
        totalRemainingGrant {
            ...Money
            __typename
        }
        totalGrantedRefund {
            ...Money
            __typename
        }
        totalRefundPending {
            ...Money
            __typename
        }
        totalRefunded {
            ...Money
            __typename
        }
        actions
        totalAuthorizePending {
            ...Money
            __typename
        }
        totalAuthorized {
            ...Money
            __typename
        }
        totalCaptured {
            ...Money
            __typename
        }
        totalCharged {
            ...Money
            __typename
        }
        totalChargePending {
            ...Money
            __typename
        }
        totalCanceled {
            ...Money
            __typename
        }
        totalCancelPending {
            ...Money
            __typename
        }
        totalBalance {
            ...Money
            __typename
        }
        undiscountedTotal {
            net {
                ...Money
                __typename
            }
            gross {
                ...Money
                __typename
            }
            __typename
        }
        user {
            id
            email
            __typename
        }
        userEmail
        shippingMethods {
            id
            name
            price {
                ...Money
                __typename
            }
            active
            message
            __typename
        }
        invoices {
            ...Invoice
            __typename
        }
        channel {
            isActive
            id
            name
            currencyCode
            slug
            defaultCountry {
                code
                __typename
            }
            orderSettings {
                markAsPaidStrategy
                __typename
            }
            __typename
        }
        isPaid
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }

    fragment Address on Address {
        city
        cityArea
        companyName
        country {
            __typename
            code
            country
        }
        countryArea
        firstName
        id
        lastName
        phone
        postalCode
        streetAddress1
        streetAddress2
        __typename
    }

    fragment TransactionItem on TransactionItem {
        id
        pspReference
        actions
        name
        externalUrl
        events {
            ...TransactionEvent
            __typename
        }
        authorizedAmount {
            ...Money
            __typename
        }
        chargedAmount {
            ...Money
            __typename
        }
        refundedAmount {
            ...Money
            __typename
        }
        canceledAmount {
            ...Money
            __typename
        }
        authorizePendingAmount {
            ...Money
            __typename
        }
        chargePendingAmount {
            ...Money
            __typename
        }
        refundPendingAmount {
            ...Money
            __typename
        }
        cancelPendingAmount {
            ...Money
            __typename
        }
        __typename
    }

    fragment TransactionEvent on TransactionEvent {
        id
        pspReference
        amount {
            ...Money
            __typename
        }
        type
        message
        createdAt
        createdBy {
            ... on User {
                ...StaffMemberAvatar
                __typename
            }
            ... on App {
                ...AppAvatar
                __typename
            }
            __typename
        }
        externalUrl
        __typename
    }

    fragment Money on Money {
        amount
        currency
        __typename
    }

    fragment StaffMemberAvatar on User {
        ...StaffMember
        avatar(size: 512) {
            url
            __typename
        }
        __typename
    }

    fragment StaffMember on User {
        id
        email
        firstName
        isActive
        lastName
        __typename
    }

    fragment AppAvatar on App {
        id
        name
        __typename
    }

    fragment OrderPayment on Payment {
        id
        isActive
        actions
        gateway
        paymentMethodType
        availableCaptureAmount {
            ...Money
            __typename
        }
        capturedAmount {
            ...Money
            __typename
        }
        total {
            ...Money
            __typename
        }
        availableRefundAmount {
            ...Money
            __typename
        }
        modified
        transactions {
            id
            token
            created
            kind
            isSuccess
            __typename
        }
        __typename
    }

    fragment OrderGiftCard on GiftCard {
        id
        last4CodeChars
        events {
            id
            type
            orderId
            date
            balance {
                initialBalance {
                    ...Money
                    __typename
                }
                currentBalance {
                    ...Money
                    __typename
                }
                oldInitialBalance {
                    ...Money
                    __typename
                }
                oldCurrentBalance {
                    ...Money
                    __typename
                }
                __typename
            }
            __typename
        }
        __typename
    }

    fragment OrderGrantedRefund on OrderGrantedRefund {
        id
        createdAt
        shippingCostsIncluded
        amount {
            currency
            amount
            __typename
        }
        reason
        user {
            ...UserBaseAvatar
            __typename
        }
        app {
            id
            name
            __typename
        }
        __typename
    }

    fragment UserBaseAvatar on User {
        id
        firstName
        lastName
        email
        avatar {
            url
            alt
            __typename
        }
        __typename
    }

    fragment OrderEvent on OrderEvent {
        id
        amount
        shippingCostsIncluded
        date
        email
        emailType
        invoiceNumber
        discount {
            valueType
            value
            reason
            amount {
                amount
                currency
                __typename
            }
            oldValueType
            oldValue
            oldAmount {
                amount
                currency
                __typename
            }
            __typename
        }
        relatedOrder {
            id
            number
            __typename
        }
        message
        quantity
        transactionReference
        type
        user {
            id
            email
            firstName
            lastName
            __typename
        }
        app {
            id
            name
            appUrl
            __typename
        }
        lines {
            quantity
            itemName
            discount {
                valueType
                value
                reason
                amount {
                    amount
                    currency
                    __typename
                }
                oldValueType
                oldValue
                oldAmount {
                    amount
                    currency
                    __typename
                }
                __typename
            }
            orderLine {
                id
                productName
                variantName
                __typename
            }
            __typename
        }
        __typename
    }

    fragment Fulfillment on Fulfillment {
        ...Metadata
        id
        lines {
            id
            quantity
            orderLine {
                ...OrderLine
                __typename
            }
            __typename
        }
        fulfillmentOrder
        status
        trackingNumber
        warehouse {
            id
            name
            __typename
        }
        __typename
    }

    fragment OrderLine on OrderLine {
        id
        isShippingRequired
        allocations {
            id
            quantity
            warehouse {
                id
                name
                __typename
            }
            __typename
        }
        variant {
            id
            name
            quantityAvailable
            preorder {
                endDate
                __typename
            }
            stocks {
                ...Stock
                __typename
            }
            product {
                id
                isAvailableForPurchase
                __typename
            }
            __typename
        }
        productName
        productSku
        quantity
        quantityFulfilled
        quantityToFulfill
        totalPrice {
            ...TaxedMoney
            __typename
        }
        unitDiscount {
            amount
            currency
            __typename
        }
        unitDiscountValue
        unitDiscountReason
        unitDiscountType
        undiscountedUnitPrice {
            currency
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        unitPrice {
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        thumbnail {
            url
            __typename
        }
        __typename
    }

    fragment Stock on Stock {
        id
        quantity
        quantityAllocated
        warehouse {
            ...Warehouse
            __typename
        }
        __typename
    }

    fragment Warehouse on Warehouse {
        id
        name
        __typename
    }

    fragment TaxedMoney on TaxedMoney {
        net {
            ...Money
            __typename
        }
        gross {
            ...Money
            __typename
        }
        __typename
    }

    fragment Invoice on Invoice {
        id
        number
        createdAt
        url
        status
        __typename
    }
`;

export const PARENT_CATEGORY_LIST = gql`
    query MyQuery {
        categories(level: 0, first: 200) {
            edges {
                node {
                    id
                    name
                    level
                    description
                    children(first: 100) {
                        edges {
                            node {
                                id
                                name
                                description
                            }
                        }
                    }
                }
            }
        }
    }
`;

export const NEW_PARENT_CATEGORY_LIST = gql`
    query MyQuery($first: Int, $after: String = "") {
        categories(level: 0, first: $first, after: $after) {
            edges {
                node {
                    id
                    name
                    level
                    description
                    children(first: $first, after: $after) {
                        edges {
                            node {
                                id
                                name
                                description
                            }
                        }
                    }
                }
            }
            pageInfo {
                endCursor
                hasNextPage
                startCursor
                hasPreviousPage
            }
            totalCount
        }
    }
`;

export const CONFIRM_ORDER = gql`
    mutation OrderConfirm($id: ID!) {
        orderConfirm(id: $id) {
            errors {
                ...OrderError
                __typename
            }
            order {
                ...OrderDetails
                __typename
            }
            __typename
        }
    }

    fragment OrderError on OrderError {
        code
        field
        addressType
        message
        orderLines
        __typename
    }

    fragment OrderDetails on Order {
        id
        token
        ...Metadata
        billingAddress {
            ...Address
            __typename
        }
        transactions {
            ...TransactionItem
            __typename
        }
        payments {
            ...OrderPayment
            __typename
        }
        giftCards {
            ...OrderGiftCard
            __typename
        }
        grantedRefunds {
            ...OrderGrantedRefund
            __typename
        }
        isShippingRequired
        canFinalize
        created
        customerNote
        discounts {
            id
            type
            calculationMode: valueType
            value
            reason
            amount {
                ...Money
                __typename
            }
            __typename
        }
        events {
            ...OrderEvent
            __typename
        }
        fulfillments {
            ...Fulfillment
            __typename
        }
        lines {
            ...OrderLine
            __typename
        }
        number
        isPaid
        paymentStatus
        shippingAddress {
            ...Address
            __typename
        }
        deliveryMethod {
            __typename
            ... on ShippingMethod {
                id
                __typename
            }
            ... on Warehouse {
                id
                clickAndCollectOption
                __typename
            }
        }
        shippingMethod {
            id
            __typename
        }
        shippingMethodName
        collectionPointName
        shippingPrice {
            gross {
                amount
                currency
                __typename
            }
            __typename
        }
        status
        subtotal {
            gross {
                ...Money
                __typename
            }
            net {
                ...Money
                __typename
            }
            __typename
        }
        total {
            gross {
                ...Money
                __typename
            }
            net {
                ...Money
                __typename
            }
            tax {
                ...Money
                __typename
            }
            __typename
        }
        totalRemainingGrant {
            ...Money
            __typename
        }
        totalGrantedRefund {
            ...Money
            __typename
        }
        totalRefundPending {
            ...Money
            __typename
        }
        totalRefunded {
            ...Money
            __typename
        }
        actions
        totalAuthorizePending {
            ...Money
            __typename
        }
        totalAuthorized {
            ...Money
            __typename
        }
        totalCaptured {
            ...Money
            __typename
        }
        totalCharged {
            ...Money
            __typename
        }
        totalChargePending {
            ...Money
            __typename
        }
        totalCanceled {
            ...Money
            __typename
        }
        totalCancelPending {
            ...Money
            __typename
        }
        totalBalance {
            ...Money
            __typename
        }
        undiscountedTotal {
            net {
                ...Money
                __typename
            }
            gross {
                ...Money
                __typename
            }
            __typename
        }
        user {
            id
            email
            __typename
        }
        userEmail
        shippingMethods {
            id
            name
            price {
                ...Money
                __typename
            }
            active
            message
            __typename
        }
        invoices {
            ...Invoice
            __typename
        }
        channel {
            isActive
            id
            name
            currencyCode
            slug
            defaultCountry {
                code
                __typename
            }
            orderSettings {
                markAsPaidStrategy
                __typename
            }
            __typename
        }
        isPaid
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }

    fragment Address on Address {
        city
        cityArea
        companyName
        country {
            __typename
            code
            country
        }
        countryArea
        firstName
        id
        lastName
        phone
        postalCode
        streetAddress1
        streetAddress2
        __typename
    }

    fragment TransactionItem on TransactionItem {
        id
        pspReference
        actions
        name
        externalUrl
        events {
            ...TransactionEvent
            __typename
        }
        authorizedAmount {
            ...Money
            __typename
        }
        chargedAmount {
            ...Money
            __typename
        }
        refundedAmount {
            ...Money
            __typename
        }
        canceledAmount {
            ...Money
            __typename
        }
        authorizePendingAmount {
            ...Money
            __typename
        }
        chargePendingAmount {
            ...Money
            __typename
        }
        refundPendingAmount {
            ...Money
            __typename
        }
        cancelPendingAmount {
            ...Money
            __typename
        }
        __typename
    }

    fragment TransactionEvent on TransactionEvent {
        id
        pspReference
        amount {
            ...Money
            __typename
        }
        type
        message
        createdAt
        createdBy {
            ... on User {
                ...StaffMemberAvatar
                __typename
            }
            ... on App {
                ...AppAvatar
                __typename
            }
            __typename
        }
        externalUrl
        __typename
    }

    fragment Money on Money {
        amount
        currency
        __typename
    }

    fragment StaffMemberAvatar on User {
        ...StaffMember
        avatar(size: 512) {
            url
            __typename
        }
        __typename
    }

    fragment StaffMember on User {
        id
        email
        firstName
        isActive
        lastName
        __typename
    }

    fragment AppAvatar on App {
        id
        name
        __typename
    }

    fragment OrderPayment on Payment {
        id
        isActive
        actions
        gateway
        paymentMethodType
        availableCaptureAmount {
            ...Money
            __typename
        }
        capturedAmount {
            ...Money
            __typename
        }
        total {
            ...Money
            __typename
        }
        availableRefundAmount {
            ...Money
            __typename
        }
        modified
        transactions {
            id
            token
            created
            kind
            isSuccess
            __typename
        }
        __typename
    }

    fragment OrderGiftCard on GiftCard {
        id
        last4CodeChars
        events {
            id
            type
            orderId
            date
            balance {
                initialBalance {
                    ...Money
                    __typename
                }
                currentBalance {
                    ...Money
                    __typename
                }
                oldInitialBalance {
                    ...Money
                    __typename
                }
                oldCurrentBalance {
                    ...Money
                    __typename
                }
                __typename
            }
            __typename
        }
        __typename
    }

    fragment OrderGrantedRefund on OrderGrantedRefund {
        id
        createdAt
        shippingCostsIncluded
        amount {
            currency
            amount
            __typename
        }
        reason
        user {
            ...UserBaseAvatar
            __typename
        }
        app {
            id
            name
            __typename
        }
        __typename
    }

    fragment UserBaseAvatar on User {
        id
        firstName
        lastName
        email
        avatar {
            url
            alt
            __typename
        }
        __typename
    }

    fragment OrderEvent on OrderEvent {
        id
        amount
        shippingCostsIncluded
        date
        email
        emailType
        invoiceNumber
        discount {
            valueType
            value
            reason
            amount {
                amount
                currency
                __typename
            }
            oldValueType
            oldValue
            oldAmount {
                amount
                currency
                __typename
            }
            __typename
        }
        relatedOrder {
            id
            number
            __typename
        }
        message
        quantity
        transactionReference
        type
        user {
            id
            email
            firstName
            lastName
            __typename
        }
        app {
            id
            name
            appUrl
            __typename
        }
        lines {
            quantity
            itemName
            discount {
                valueType
                value
                reason
                amount {
                    amount
                    currency
                    __typename
                }
                oldValueType
                oldValue
                oldAmount {
                    amount
                    currency
                    __typename
                }
                __typename
            }
            orderLine {
                id
                productName
                variantName
                __typename
            }
            __typename
        }
        __typename
    }

    fragment Fulfillment on Fulfillment {
        ...Metadata
        id
        lines {
            id
            quantity
            orderLine {
                ...OrderLine
                __typename
            }
            __typename
        }
        fulfillmentOrder
        status
        trackingNumber
        warehouse {
            id
            name
            __typename
        }
        __typename
    }

    fragment OrderLine on OrderLine {
        id
        isShippingRequired
        allocations {
            id
            quantity
            warehouse {
                id
                name
                __typename
            }
            __typename
        }
        variant {
            id
            name
            quantityAvailable
            preorder {
                endDate
                __typename
            }
            stocks {
                ...Stock
                __typename
            }
            product {
                id
                isAvailableForPurchase
                __typename
            }
            __typename
        }
        productName
        productSku
        quantity
        quantityFulfilled
        quantityToFulfill
        totalPrice {
            ...TaxedMoney
            __typename
        }
        unitDiscount {
            amount
            currency
            __typename
        }
        unitDiscountValue
        unitDiscountReason
        unitDiscountType
        undiscountedUnitPrice {
            currency
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        unitPrice {
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        thumbnail {
            url
            __typename
        }
        __typename
    }

    fragment Stock on Stock {
        id
        quantity
        quantityAllocated
        warehouse {
            ...Warehouse
            __typename
        }
        __typename
    }

    fragment Warehouse on Warehouse {
        id
        name
        __typename
    }

    fragment TaxedMoney on TaxedMoney {
        net {
            ...Money
            __typename
        }
        gross {
            ...Money
            __typename
        }
        __typename
    }

    fragment Invoice on Invoice {
        id
        number
        createdAt
        url
        status
        __typename
    }
`;

export const CATEGORY_FILTER_LIST = gql`
    query ProductListPaginated($channel: String!, $first: Int!, $after: String, $categoryId: [ID!]!) {
        products(filter: { categories: $categoryId }, first: $first, after: $after, channel: $channel) {
            totalCount
            edges {
                node {
                    ...ProductListItem
                    tags {
                        name
                        id
                    }
                    __typename
                }
                cursor
                __typename
            }
            pageInfo {
                endCursor
                hasNextPage
                hasPreviousPage
                startCursor
                __typename
            }
            __typename
        }
    }

    fragment ProductListItem on Product {
        id
        name
        slug
        pricing {
            priceRange {
                start {
                    gross {
                        amount
                        currency
                        __typename
                    }
                    __typename
                }
                stop {
                    gross {
                        amount
                        currency
                        __typename
                    }
                    __typename
                }
                __typename
            }
            discount {
                currency
                __typename
            }
            __typename
        }
        category {
            id
            name
            __typename
        }
        thumbnail(size: 1024, format: WEBP) {
            url
            alt
            __typename
        }
        variants {
            id
            __typename
        }
        images {
            url
            __typename
        }
        description
        updatedAt
        channelListings {
            publishedAt
            isPublished
            __typename
        }
        __typename
    }
`;

export const EXPORT_LIST = gql`
    query OrdersExport($first: Int!, $filter: OrderFilterInput, $sort: OrderSortingInput) {
        orders(first: $first, filter: $filter, sortBy: $sort) {
            edges {
                node {
                    courierPartner {
                        name
                        trackingUrl
                        id
                        __typename
                    }
                    fulfillments {
                        id
                        trackingNumber
                        __typename
                    }
                    shippingAddress {
                        firstName
                        lastName
                        phone
                        streetAddress1
                        streetAddress2
                        countryArea
                        country {
                            country
                            __typename
                        }
                        city
                        __typename
                    }
                    userEmail
                    invoices {
                        number
                        url
                        id
                        __typename
                    }
                    created
                    paymentStatusDisplay
                    channel {
                        currencyCode
                        __typename
                    }
                    total {
                        gross {
                            amount
                            currency
                            __typename
                        }
                        tax {
                            amount
                            currency
                            __typename
                        }
                        __typename
                    }
                    shippingPrice {
                        gross {
                            amount
                            currency
                            __typename
                        }
                        __typename
                    }
                    id
                    lines {
                        productName
                        productSku
                        totalPrice {
                            gross {
                                amount
                                currency
                                __typename
                            }
                            __typename
                        }
                        __typename
                    }
                    number
                    user {
                        lastName
                        firstName
                        __typename
                    }
                    updatedAt
                    status
                    paymentStatus
                    __typename
                    billingAddress {
                        streetAddress2
                        streetAddress1
                        phone
                        lastName
                        firstName
                        countryArea
                        country {
                            code
                            country
                        }
                        companyName
                        cityArea
                        city
                    }
                    discounts {
                        id
                        name
                        reason
                        type
                        value
                        amount {
                            amount
                            currency
                        }
                    }
                    totalRefunded {
                        amount
                        currency
                    }
                    origin
                }
                __typename
            }
            pageInfo {
                endCursor
                hasNextPage
                hasPreviousPage
                startCursor
                __typename
            }
            __typename
        }
    }
`;

export const RELATED_PRODUCT = gql`
    query MyQuery($id: ID!, $channel: String!) {
        category(id: $id) {
            id
            products(channel: $channel, first: 10) {
                edges {
                    node {
                        id
                        name
                        slug
                        media {
                            url
                            alt
                        }
                        thumbnail(size: 1024, format: WEBP) {
                            url
                            alt
                        }
                        variants {
                            id
                        }
                        pricing {
                            priceRange {
                                start {
                                    gross {
                                        amount
                                        currency
                                    }
                                }
                                stop {
                                    gross {
                                        amount
                                        currency
                                    }
                                }
                            }
                            discount {
                                currency
                            }
                        }
                        description
                        defaultVariant {
                            id
                            quantityAvailable
                            costPrice
                        }
                        category {
                            id
                            name
                        }
                        metadata {
                            key
                            value
                        }
                    }
                }
            }
        }
    }
`;

export const YOU_MAY_LIKE = gql`
    query MyQuery($productId: ID!, $channel: String!) {
        product(id: $productId, channel: $channel) {
            id
            name
            slug
            pricing {
                priceRange {
                    start {
                        gross {
                            amount
                            currency
                        }
                    }
                    stop {
                        gross {
                            amount
                            currency
                        }
                    }
                }
                discount {
                    currency
                }
            }
            category {
                id
                name
            }
            thumbnail(size: 1024, format: WEBP) {
                url
                alt
            }
            images {
                url
                alt
            }
            variants {
                id
                quantityAvailable
                name
                pricing {
                    price {
                        gross {
                            amount
                            currency
                        }
                    }
                    costPrice {
                        gross {
                            amount
                            currency
                        }
                    }
                }
                sku
            }
            created
            description
            images {
                url
            }
            defaultVariant {
                id
                name
                quantityAvailable
                sku
                costPrice
            }
            metadata {
                key
                value
            }
            tags {
                name
                id
            }
            productFinish {
                id
                name
            }
            productstyle {
                id
                name
            }
            prouctDesign {
                id
                name
            }
            productStoneType {
                id
                name
            }
            nextProduct
            previousProduct
            productSize {
                id
                name
            }
            productStonecolor {
                id
                name
            }
            productItemtype {
                id
                name
            }
            getUpsells {
                name
                productId
                id
            }
            getCrosssells {
                id
                name
                productId
            }
        }
    }
`;

export const PRODUCT_LIST_BY_ID = gql`
    query MyQuery($ids: [ID!]!, $channel: String!) {
        products(filter: { ids: $ids }, channel: $channel, first: 10) {
            edges {
                node {
                    id
                    media {
                        url
                        alt
                    }
                    name
                    description
                    variants {
                        id
                        sku
                    }
                    thumbnail {
                        url
                        alt
                    }
                    category {
                        id
                        name
                    }
                    pricing {
                        priceRange {
                            start {
                                gross {
                                    amount
                                }
                            }
                            stop {
                                gross {
                                    amount
                                }
                            }
                        }
                    }
                    defaultVariant {
                        id
                        costPrice
                        name
                        quantityAvailable
                    }
                }
            }
        }
    }
`;

export const DISCOUNT_LIST = gql`
    query SaleList($after: String, $before: String, $first: Int, $last: Int, $filter: SaleFilterInput, $sort: SaleSortingInput, $channel: String) {
        sales(after: $after, before: $before, first: $first, last: $last, filter: $filter, sortBy: $sort, channel: $channel) {
            edges {
                node {
                    ...Sale
                    __typename
                }
                __typename
            }
            pageInfo {
                ...PageInfo
                __typename
            }
            __typename
        }
    }

    fragment Sale on Sale {
        ...Metadata
        id
        name
        type
        startDate
        endDate
        channelListings {
            id
            channel {
                id
                name
                currencyCode
                __typename
            }
            discountValue
            currency
            __typename
        }
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }

    fragment PageInfo on PageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
        __typename
    }
`;

export const CREATE_DISCOUNT = gql`
    mutation SaleCreate($input: SaleInput!) {
        saleCreate(input: $input) {
            errors {
                ...DiscountError
                __typename
            }
            sale {
                ...Sale
                __typename
            }
            __typename
        }
    }

    fragment DiscountError on DiscountError {
        code
        field
        channels
        message
        __typename
    }

    fragment Sale on Sale {
        ...Metadata
        id
        name
        type
        startDate
        endDate
        channelListings {
            id
            channel {
                id
                name
                currencyCode
                __typename
            }
            discountValue
            currency
            __typename
        }
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }
`;
export const DISCOUNT_DETAILS = gql`
    query SaleDetails(
        $id: ID!
        $after: String
        $before: String
        $first: Int
        $last: Int
        $includeVariants: Boolean!
        $includeProducts: Boolean!
        $includeCollections: Boolean!
        $includeCategories: Boolean!
    ) {
        sale(id: $id) {
            ...SaleDetails
            metadata {
                key
                value
            }
            __typename
        }
    }

    fragment SaleDetails on Sale {
        ...Sale
        variantsCount: variants {
            totalCount
            __typename
        }
        productsCount: products {
            totalCount
            __typename
        }
        collectionsCount: collections {
            totalCount
            __typename
        }
        categoriesCount: categories {
            totalCount
            __typename
        }
        variants(after: $after, before: $before, first: $first, last: $last) @include(if: $includeVariants) {
            edges {
                node {
                    id
                    name
                    product {
                        id
                        name
                        thumbnail {
                            url
                            __typename
                        }
                        productType {
                            id
                            name
                            __typename
                        }
                        channelListings {
                            ...ChannelListingProductWithoutPricing
                            __typename
                        }
                        __typename
                    }
                    __typename
                }
                __typename
            }
            pageInfo {
                ...PageInfo
                __typename
            }
            __typename
        }
        products(after: $after, before: $before, first: $first, last: $last) @include(if: $includeProducts) {
            edges {
                node {
                    id
                    name
                    productType {
                        id
                        name
                        __typename
                    }
                    thumbnail {
                        url
                        __typename
                    }
                    channelListings {
                        ...ChannelListingProductWithoutPricing
                        __typename
                    }
                    __typename
                }
                __typename
            }
            pageInfo {
                ...PageInfo
                __typename
            }
            __typename
        }
        categories(after: $after, before: $before, first: $first, last: $last) @include(if: $includeCategories) {
            edges {
                node {
                    id
                    name
                    products {
                        totalCount
                        __typename
                    }
                    __typename
                }
                __typename
            }
            pageInfo {
                ...PageInfo
                __typename
            }
            __typename
        }
        collections(after: $after, before: $before, first: $first, last: $last) @include(if: $includeCollections) {
            edges {
                node {
                    id
                    name
                    products {
                        totalCount
                        __typename
                    }
                    __typename
                }
                __typename
            }
            pageInfo {
                ...PageInfo
                __typename
            }
            __typename
        }
        __typename
    }

    fragment Sale on Sale {
        ...Metadata
        id
        name
        type
        startDate
        endDate
        channelListings {
            id
            channel {
                id
                name
                currencyCode
                __typename
            }
            discountValue
            currency
            __typename
        }
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }

    fragment ChannelListingProductWithoutPricing on ProductChannelListing {
        isPublished
        publicationDate
        isAvailableForPurchase
        availableForPurchase
        visibleInListings
        channel {
            id
            name
            currencyCode
            __typename
        }
        __typename
    }

    fragment PageInfo on PageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
        __typename
    }
`;

export const UPDATE_DISCOUNT_CHANNEL = gql`
    mutation SaleChannelListingUpdate($id: ID!, $input: SaleChannelListingInput!) {
        saleChannelListingUpdate(id: $id, input: $input) {
            errors {
                ...DiscountError
                __typename
            }
            sale {
                ...Sale
                __typename
            }
            __typename
        }
    }

    fragment DiscountError on DiscountError {
        code
        field
        channels
        message
        __typename
    }

    fragment Sale on Sale {
        ...Metadata
        id
        name
        type
        startDate
        endDate
        channelListings {
            id
            channel {
                id
                name
                currencyCode
                __typename
            }
            discountValue
            currency
            __typename
        }
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }
`;

export const DELETE_DISCOUNT = gql`
    mutation SaleBulkDelete($ids: [ID!]!) {
        saleBulkDelete(ids: $ids) {
            errors {
                ...SaleBulkDeleteError
                __typename
            }
            __typename
        }
    }

    fragment SaleBulkDeleteError on DiscountError {
        code
        field
        message
        __typename
    }
`;

export const UPDATE_DISCOUNT_METADATA = gql`
    mutation UpdateMetadata($id: ID!, $input: [MetadataInput!]!, $keysToDelete: [String!]!) {
        updateMetadata(id: $id, input: $input) {
            errors {
                ...MetadataError
                __typename
            }
            item {
                ...Metadata
                ... on Node {
                    id
                    __typename
                }
                __typename
            }
            __typename
        }
        deleteMetadata(id: $id, keys: $keysToDelete) {
            errors {
                ...MetadataError
                __typename
            }
            item {
                ...Metadata
                ... on Node {
                    id
                    __typename
                }
                __typename
            }
            __typename
        }
    }

    fragment MetadataError on MetadataError {
        code
        field
        message
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }
`;

export const ASSIGN_DISCOUNT = gql`
    mutation SaleCataloguesAdd(
        $input: CatalogueInput!
        $id: ID!
        $after: String
        $before: String
        $first: Int
        $last: Int
        $includeVariants: Boolean!
        $includeProducts: Boolean!
        $includeCollections: Boolean!
        $includeCategories: Boolean!
    ) {
        saleCataloguesAdd(id: $id, input: $input) {
            errors {
                ...DiscountError
                __typename
            }
            sale {
                ...SaleDetails
                __typename
            }
            __typename
        }
    }

    fragment DiscountError on DiscountError {
        code
        field
        channels
        message
        __typename
    }

    fragment SaleDetails on Sale {
        ...Sale
        variantsCount: variants {
            totalCount
            __typename
        }
        productsCount: products {
            totalCount
            __typename
        }
        collectionsCount: collections {
            totalCount
            __typename
        }
        categoriesCount: categories {
            totalCount
            __typename
        }
        variants(after: $after, before: $before, first: $first, last: $last) @include(if: $includeVariants) {
            edges {
                node {
                    id
                    name
                    product {
                        id
                        name
                        thumbnail {
                            url
                            __typename
                        }
                        productType {
                            id
                            name
                            __typename
                        }
                        channelListings {
                            ...ChannelListingProductWithoutPricing
                            __typename
                        }
                        __typename
                    }
                    __typename
                }
                __typename
            }
            pageInfo {
                ...PageInfo
                __typename
            }
            __typename
        }
        products(after: $after, before: $before, first: $first, last: $last) @include(if: $includeProducts) {
            edges {
                node {
                    id
                    name
                    productType {
                        id
                        name
                        __typename
                    }
                    thumbnail {
                        url
                        __typename
                    }
                    channelListings {
                        ...ChannelListingProductWithoutPricing
                        __typename
                    }
                    __typename
                }
                __typename
            }
            pageInfo {
                ...PageInfo
                __typename
            }
            __typename
        }
        categories(after: $after, before: $before, first: $first, last: $last) @include(if: $includeCategories) {
            edges {
                node {
                    id
                    name
                    products {
                        totalCount
                        __typename
                    }
                    __typename
                }
                __typename
            }
            pageInfo {
                ...PageInfo
                __typename
            }
            __typename
        }
        collections(after: $after, before: $before, first: $first, last: $last) @include(if: $includeCollections) {
            edges {
                node {
                    id
                    name
                    products {
                        totalCount
                        __typename
                    }
                    __typename
                }
                __typename
            }
            pageInfo {
                ...PageInfo
                __typename
            }
            __typename
        }
        __typename
    }

    fragment Sale on Sale {
        ...Metadata
        id
        name
        type
        startDate
        endDate
        channelListings {
            id
            channel {
                id
                name
                currencyCode
                __typename
            }
            discountValue
            currency
            __typename
        }
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }

    fragment ChannelListingProductWithoutPricing on ProductChannelListing {
        isPublished
        publicationDate
        isAvailableForPurchase
        availableForPurchase
        visibleInListings
        channel {
            id
            name
            currencyCode
            __typename
        }
        __typename
    }

    fragment PageInfo on PageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
        __typename
    }
`;

export const REMOVE_DISCOUNT_DATA = gql`
    mutation SaleCataloguesRemove(
        $input: CatalogueInput!
        $id: ID!
        $after: String
        $before: String
        $first: Int
        $last: Int
        $includeVariants: Boolean!
        $includeProducts: Boolean!
        $includeCollections: Boolean!
        $includeCategories: Boolean!
    ) {
        saleCataloguesRemove(id: $id, input: $input) {
            errors {
                ...DiscountError
                __typename
            }
            sale {
                ...SaleDetails
                __typename
            }
            __typename
        }
    }

    fragment DiscountError on DiscountError {
        code
        field
        channels
        message
        __typename
    }

    fragment SaleDetails on Sale {
        ...Sale
        variantsCount: variants {
            totalCount
            __typename
        }
        productsCount: products {
            totalCount
            __typename
        }
        collectionsCount: collections {
            totalCount
            __typename
        }
        categoriesCount: categories {
            totalCount
            __typename
        }
        variants(after: $after, before: $before, first: $first, last: $last) @include(if: $includeVariants) {
            edges {
                node {
                    id
                    name
                    product {
                        id
                        name
                        thumbnail {
                            url
                            __typename
                        }
                        productType {
                            id
                            name
                            __typename
                        }
                        channelListings {
                            ...ChannelListingProductWithoutPricing
                            __typename
                        }
                        __typename
                    }
                    __typename
                }
                __typename
            }
            pageInfo {
                ...PageInfo
                __typename
            }
            __typename
        }
        products(after: $after, before: $before, first: $first, last: $last) @include(if: $includeProducts) {
            edges {
                node {
                    id
                    name
                    productType {
                        id
                        name
                        __typename
                    }
                    thumbnail {
                        url
                        __typename
                    }
                    channelListings {
                        ...ChannelListingProductWithoutPricing
                        __typename
                    }
                    __typename
                }
                __typename
            }
            pageInfo {
                ...PageInfo
                __typename
            }
            __typename
        }
        categories(after: $after, before: $before, first: $first, last: $last) @include(if: $includeCategories) {
            edges {
                node {
                    id
                    name
                    products {
                        totalCount
                        __typename
                    }
                    __typename
                }
                __typename
            }
            pageInfo {
                ...PageInfo
                __typename
            }
            __typename
        }
        collections(after: $after, before: $before, first: $first, last: $last) @include(if: $includeCollections) {
            edges {
                node {
                    id
                    name
                    products {
                        totalCount
                        __typename
                    }
                    __typename
                }
                __typename
            }
            pageInfo {
                ...PageInfo
                __typename
            }
            __typename
        }
        __typename
    }

    fragment Sale on Sale {
        ...Metadata
        id
        name
        type
        startDate
        endDate
        channelListings {
            id
            channel {
                id
                name
                currencyCode
                __typename
            }
            discountValue
            currency
            __typename
        }
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }

    fragment ChannelListingProductWithoutPricing on ProductChannelListing {
        isPublished
        publicationDate
        isAvailableForPurchase
        availableForPurchase
        visibleInListings
        channel {
            id
            name
            currencyCode
            __typename
        }
        __typename
    }

    fragment PageInfo on PageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
        __typename
    }
`;

export const UPDATE_DISCOUNT = gql`
    mutation SaleUpdate($input: SaleInput!, $id: ID!, $channelInput: SaleChannelListingInput!) {
        saleUpdate(id: $id, input: $input) {
            errors {
                ...DiscountError
                __typename
            }
            __typename
        }
        saleChannelListingUpdate(id: $id, input: $channelInput) {
            errors {
                ...DiscountError
                __typename
            }
            sale {
                ...Sale
                __typename
            }
            __typename
        }
    }

    fragment DiscountError on DiscountError {
        code
        field
        channels
        message
        __typename
    }

    fragment Sale on Sale {
        ...Metadata
        id
        name
        type
        startDate
        endDate
        channelListings {
            id
            channel {
                id
                name
                currencyCode
                __typename
            }
            discountValue
            currency
            __typename
        }
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }
`;

export const ORDER_FULLFILMENT_REFUND = gql`
    mutation OrderFulfillmentRefundProducts($input: OrderRefundProductsInput!, $order: ID!) {
        orderFulfillmentRefundProducts(input: $input, order: $order) {
            errors {
                ...OrderError
                __typename
            }
            fulfillment {
                ...Fulfillment
                __typename
            }
            order {
                ...OrderDetails
                __typename
            }
            __typename
        }
    }

    fragment OrderError on OrderError {
        code
        field
        addressType
        message
        orderLines
        __typename
    }

    fragment Fulfillment on Fulfillment {
        ...Metadata
        id
        lines {
            id
            quantity
            orderLine {
                ...OrderLine
                __typename
            }
            __typename
        }
        fulfillmentOrder
        status
        trackingNumber
        warehouse {
            id
            name
            __typename
        }
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }

    fragment OrderLine on OrderLine {
        id
        isShippingRequired
        allocations {
            id
            quantity
            warehouse {
                id
                name
                __typename
            }
            __typename
        }
        variant {
            id
            name
            quantityAvailable
            preorder {
                endDate
                __typename
            }
            stocks {
                ...Stock
                __typename
            }
            product {
                id
                isAvailableForPurchase
                __typename
            }
            __typename
        }
        productName
        productSku
        quantity
        quantityFulfilled
        quantityToFulfill
        totalPrice {
            ...TaxedMoney
            __typename
        }
        unitDiscount {
            amount
            currency
            __typename
        }
        unitDiscountValue
        unitDiscountReason
        unitDiscountType
        undiscountedUnitPrice {
            currency
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        unitPrice {
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        thumbnail {
            url
            __typename
        }
        __typename
    }

    fragment Stock on Stock {
        id
        quantity
        quantityAllocated
        warehouse {
            ...Warehouse
            __typename
        }
        __typename
    }

    fragment Warehouse on Warehouse {
        id
        name
        __typename
    }

    fragment TaxedMoney on TaxedMoney {
        net {
            ...Money
            __typename
        }
        gross {
            ...Money
            __typename
        }
        __typename
    }

    fragment Money on Money {
        amount
        currency
        __typename
    }

    fragment OrderDetails on Order {
        id
        token
        ...Metadata
        billingAddress {
            ...Address
            __typename
        }
        transactions {
            ...TransactionItem
            __typename
        }
        payments {
            ...OrderPayment
            __typename
        }
        giftCards {
            ...OrderGiftCard
            __typename
        }
        grantedRefunds {
            ...OrderGrantedRefund
            __typename
        }
        isShippingRequired
        canFinalize
        created
        customerNote
        discounts {
            id
            type
            calculationMode: valueType
            value
            reason
            amount {
                ...Money
                __typename
            }
            __typename
        }
        events {
            ...OrderEvent
            __typename
        }
        fulfillments {
            ...Fulfillment
            __typename
        }
        lines {
            ...OrderLine
            __typename
        }
        number
        isPaid
        paymentStatus
        shippingAddress {
            ...Address
            __typename
        }
        deliveryMethod {
            __typename
            ... on ShippingMethod {
                id
                __typename
            }
            ... on Warehouse {
                id
                clickAndCollectOption
                __typename
            }
        }
        shippingMethod {
            id
            __typename
        }
        shippingMethodName
        collectionPointName
        shippingPrice {
            gross {
                amount
                currency
                __typename
            }
            __typename
        }
        status
        subtotal {
            gross {
                ...Money
                __typename
            }
            net {
                ...Money
                __typename
            }
            __typename
        }
        total {
            gross {
                ...Money
                __typename
            }
            net {
                ...Money
                __typename
            }
            tax {
                ...Money
                __typename
            }
            __typename
        }
        totalRemainingGrant {
            ...Money
            __typename
        }
        totalGrantedRefund {
            ...Money
            __typename
        }
        totalRefundPending {
            ...Money
            __typename
        }
        totalRefunded {
            ...Money
            __typename
        }
        actions
        totalAuthorizePending {
            ...Money
            __typename
        }
        totalAuthorized {
            ...Money
            __typename
        }
        totalCaptured {
            ...Money
            __typename
        }
        totalCharged {
            ...Money
            __typename
        }
        totalChargePending {
            ...Money
            __typename
        }
        totalCanceled {
            ...Money
            __typename
        }
        totalCancelPending {
            ...Money
            __typename
        }
        totalBalance {
            ...Money
            __typename
        }
        undiscountedTotal {
            net {
                ...Money
                __typename
            }
            gross {
                ...Money
                __typename
            }
            __typename
        }
        user {
            id
            email
            __typename
        }
        userEmail
        shippingMethods {
            id
            name
            price {
                ...Money
                __typename
            }
            active
            message
            __typename
        }
        invoices {
            ...Invoice
            __typename
        }
        channel {
            isActive
            id
            name
            currencyCode
            slug
            defaultCountry {
                code
                __typename
            }
            orderSettings {
                markAsPaidStrategy
                __typename
            }
            __typename
        }
        isPaid
        __typename
    }

    fragment Address on Address {
        city
        cityArea
        companyName
        country {
            __typename
            code
            country
        }
        countryArea
        firstName
        id
        lastName
        phone
        postalCode
        streetAddress1
        streetAddress2
        __typename
    }

    fragment TransactionItem on TransactionItem {
        id
        pspReference
        actions
        name
        externalUrl
        events {
            ...TransactionEvent
            __typename
        }
        authorizedAmount {
            ...Money
            __typename
        }
        chargedAmount {
            ...Money
            __typename
        }
        refundedAmount {
            ...Money
            __typename
        }
        canceledAmount {
            ...Money
            __typename
        }
        authorizePendingAmount {
            ...Money
            __typename
        }
        chargePendingAmount {
            ...Money
            __typename
        }
        refundPendingAmount {
            ...Money
            __typename
        }
        cancelPendingAmount {
            ...Money
            __typename
        }
        __typename
    }

    fragment TransactionEvent on TransactionEvent {
        id
        pspReference
        amount {
            ...Money
            __typename
        }
        type
        message
        createdAt
        createdBy {
            ... on User {
                ...StaffMemberAvatar
                __typename
            }
            ... on App {
                ...AppAvatar
                __typename
            }
            __typename
        }
        externalUrl
        __typename
    }

    fragment StaffMemberAvatar on User {
        ...StaffMember
        avatar(size: 512) {
            url
            __typename
        }
        __typename
    }

    fragment StaffMember on User {
        id
        email
        firstName
        isActive
        lastName
        __typename
    }

    fragment AppAvatar on App {
        id
        name
        __typename
    }

    fragment OrderPayment on Payment {
        id
        isActive
        actions
        gateway
        paymentMethodType
        availableCaptureAmount {
            ...Money
            __typename
        }
        capturedAmount {
            ...Money
            __typename
        }
        total {
            ...Money
            __typename
        }
        availableRefundAmount {
            ...Money
            __typename
        }
        modified
        transactions {
            id
            token
            created
            kind
            isSuccess
            __typename
        }
        __typename
    }

    fragment OrderGiftCard on GiftCard {
        id
        last4CodeChars
        events {
            id
            type
            orderId
            date
            balance {
                initialBalance {
                    ...Money
                    __typename
                }
                currentBalance {
                    ...Money
                    __typename
                }
                oldInitialBalance {
                    ...Money
                    __typename
                }
                oldCurrentBalance {
                    ...Money
                    __typename
                }
                __typename
            }
            __typename
        }
        __typename
    }

    fragment OrderGrantedRefund on OrderGrantedRefund {
        id
        createdAt
        shippingCostsIncluded
        amount {
            currency
            amount
            __typename
        }
        reason
        user {
            ...UserBaseAvatar
            __typename
        }
        app {
            id
            name
            __typename
        }
        __typename
    }

    fragment UserBaseAvatar on User {
        id
        firstName
        lastName
        email
        avatar {
            url
            alt
            __typename
        }
        __typename
    }

    fragment OrderEvent on OrderEvent {
        id
        amount
        shippingCostsIncluded
        date
        email
        emailType
        invoiceNumber
        discount {
            valueType
            value
            reason
            amount {
                amount
                currency
                __typename
            }
            oldValueType
            oldValue
            oldAmount {
                amount
                currency
                __typename
            }
            __typename
        }
        relatedOrder {
            id
            number
            __typename
        }
        message
        quantity
        transactionReference
        type
        user {
            id
            email
            firstName
            lastName
            __typename
        }
        app {
            id
            name
            appUrl
            __typename
        }
        lines {
            quantity
            itemName
            discount {
                valueType
                value
                reason
                amount {
                    amount
                    currency
                    __typename
                }
                oldValueType
                oldValue
                oldAmount {
                    amount
                    currency
                    __typename
                }
                __typename
            }
            orderLine {
                id
                productName
                variantName
                __typename
            }
            __typename
        }
        __typename
    }

    fragment Invoice on Invoice {
        id
        number
        createdAt
        url
        status
        __typename
    }
`;

export const REFUND_DATA = gql`
    query OrderRefundData($orderId: ID!) {
        order(id: $orderId) {
            id
            number
            total {
                gross {
                    ...Money
                    __typename
                }
                __typename
            }
            totalCaptured {
                ...Money
                __typename
            }
            shippingPrice {
                gross {
                    ...Money
                    __typename
                }
                __typename
            }
            lines {
                ...RefundOrderLine
                quantityToFulfill
                __typename
                variant {
                    product {
                        thumbnail {
                            url
                            __typename
                        }
                        __typename
                    }
                    __typename
                }
            }
            grantedRefunds {
                ...OrderDetailsGrantedRefund
                __typename
            }
            fulfillments {
                id
                status
                fulfillmentOrder
                lines {
                    id
                    quantity
                    orderLine {
                        ...RefundOrderLine
                        __typename
                        productName
                        productSku
                        variant {
                            product {
                                thumbnail {
                                    url
                                    __typename
                                }
                                __typename
                            }
                            __typename
                        }
                    }
                    __typename
                }
                __typename
            }
            __typename
            status
        }
    }

    fragment Money on Money {
        amount
        currency
        __typename
    }

    fragment RefundOrderLine on OrderLine {
        id
        productName
        quantity
        unitPrice {
            gross {
                ...Money
                __typename
            }
            __typename
        }
        thumbnail(size: 64) {
            url
            __typename
        }
        __typename
    }
    fragment OrderDetailsGrantedRefund on OrderGrantedRefund {
        id
        reason
        amount {
            ...Money
            __typename
        }
        shippingCostsIncluded
        lines {
            id
            quantity
            orderLine {
                ...OrderLine
                __typename
            }
            __typename
        }
        __typename
    }

    fragment OrderLine on OrderLine {
        id
        isShippingRequired
        allocations {
            id
            quantity
            warehouse {
                id
                name
                __typename
            }
            __typename
        }
        variant {
            id
            name
            quantityAvailable
            preorder {
                endDate
                __typename
            }
            stocks {
                ...Stock
                __typename
            }
            product {
                id
                isAvailableForPurchase
                __typename
            }
            __typename
        }
        productName
        productSku
        quantity
        quantityFulfilled
        quantityToFulfill
        totalPrice {
            ...TaxedMoney
            __typename
        }
        unitDiscount {
            amount
            currency
            __typename
        }
        unitDiscountValue
        unitDiscountReason
        unitDiscountType
        undiscountedUnitPrice {
            currency
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        unitPrice {
            gross {
                amount
                currency
                __typename
            }
            net {
                amount
                currency
                __typename
            }
            __typename
        }
        thumbnail {
            url
            __typename
        }
        __typename
    }

    fragment Stock on Stock {
        id
        quantity
        quantityAllocated
        warehouse {
            ...Warehouse
            __typename
        }
        __typename
    }

    fragment Warehouse on Warehouse {
        id
        name
        __typename
    }

    fragment TaxedMoney on TaxedMoney {
        net {
            ...Money
            __typename
        }
        gross {
            ...Money
            __typename
        }
        __typename
    }
`;

export const REARANGE_ORDER = gql`
    mutation BulkUpdateProducts($input: BulkUpdateProductsInput!) {
        productmenuorderupdate(input: $input) {
            success
            updatedCount
        }
    }
`;

export const CREATE_MANUAL_ORDER_REFUND = gql`
    mutation CreateManualTransactionRefund($orderId: ID!, $amount: PositiveDecimal!, $currency: String!, $description: String, $pspReference: String) {
        transactionCreate(
            id: $orderId
            transaction: { name: "Manual refund", pspReference: $pspReference, amountRefunded: { amount: $amount, currency: $currency } }
            transactionEvent: { pspReference: $pspReference, message: $description }
        ) {
            transaction {
                ...TransactionItem
                __typename
            }
            errors {
                ...TransactionCreateError
                __typename
            }
            __typename
        }
    }

    fragment TransactionItem on TransactionItem {
        id
        pspReference
        actions
        name
        externalUrl
        events {
            ...TransactionEvent
            __typename
        }
        authorizedAmount {
            ...Money
            __typename
        }
        chargedAmount {
            ...Money
            __typename
        }
        refundedAmount {
            ...Money
            __typename
        }
        canceledAmount {
            ...Money
            __typename
        }
        authorizePendingAmount {
            ...Money
            __typename
        }
        chargePendingAmount {
            ...Money
            __typename
        }
        refundPendingAmount {
            ...Money
            __typename
        }
        cancelPendingAmount {
            ...Money
            __typename
        }
        __typename
    }

    fragment TransactionEvent on TransactionEvent {
        id
        pspReference
        amount {
            ...Money
            __typename
        }
        type
        message
        createdAt
        createdBy {
            ... on User {
                ...StaffMemberAvatar
                __typename
            }
            ... on App {
                ...AppAvatar
                __typename
            }
            __typename
        }
        externalUrl
        __typename
    }

    fragment Money on Money {
        amount
        currency
        __typename
    }

    fragment StaffMemberAvatar on User {
        ...StaffMember
        avatar(size: 512) {
            url
            __typename
        }
        __typename
    }

    fragment StaffMember on User {
        id
        email
        firstName
        isActive
        lastName
        __typename
    }

    fragment AppAvatar on App {
        id
        name
        __typename
    }

    fragment TransactionCreateError on TransactionCreateError {
        field
        message
        code
        __typename
    }
`;

export const ORDER_GRAND_REFUND_ORDER = gql`
    mutation OrderGrantRefundAdd($orderId: ID!, $amount: Decimal, $reason: String, $lines: [OrderGrantRefundCreateLineInput!], $grantRefundForShipping: Boolean) {
        orderGrantRefundCreate(id: $orderId, input: { amount: $amount, reason: $reason, lines: $lines, grantRefundForShipping: $grantRefundForShipping }) {
            errors {
                ...OrderGrantRefundCreateError
                __typename
            }
            grantedRefund {
                id
                __typename
            }
            order {
                totalRemainingGrant {
                    amount
                    currency
                }
            }
            __typename
        }
    }

    fragment OrderGrantRefundCreateError on OrderGrantRefundCreateError {
        field
        message
        code
        lines {
            field
            message
            code
            lineId
            __typename
        }
        __typename
    }
`;

export const MERCHANDISING_PAGINATION = gql`
    query ProductListPaginatedInitialandNext($channel: String!, $first: Int!, $after: String, $search: String!, $filter: ProductFilterInput) {
        products(first: $first, after: $after, channel: $channel, filter: $filter, search: $search, sortBy: { direction: ASC, field: ORDER_NO }) {
            totalCount
            edges {
                node {
                    ...ProductListItem
                    tags {
                        name
                        id
                        __typename
                    }
                    __typename
                }
                cursor
                __typename
            }
            pageInfo {
                endCursor
                hasNextPage
                hasPreviousPage
                startCursor
                __typename
            }
            __typename
        }
    }

    fragment ProductListItem on Product {
        id
        name
        slug
        orderNo
        defaultVariant {
            id
            name
            sku
        }
        pricing {
            priceRange {
                start {
                    gross {
                        amount
                        currency
                        __typename
                    }
                    __typename
                }
                stop {
                    gross {
                        amount
                        currency
                        __typename
                    }
                    __typename
                }
                __typename
            }
            discount {
                currency
                __typename
            }
            __typename
        }
        category {
            id
            name
            __typename
        }
        thumbnail(size: 1024) {
            url
            alt
            __typename
        }
        variants {
            id
            sku
            quantityAvailable
            __typename
        }
        media {
            url
            __typename
        }
        description
        updatedAt
        channelListings {
            publishedAt
            isPublished
            __typename
        }
        __typename
    }
`;

export const ADD_NEW_MEDIA_IMAGE = gql`
    mutation CreateFile($input: FileInput!) {
        fileCreate(input: $input) {
            file {
                id
                fileUrl
                alt
                description
                caption
                title
            }
            fileErrors {
                message
            }
        }
    }
`;
export const UPDATE_MEDIA_IMAGE = gql`
    mutation UpdateFile($file_url: String!, $input: FileInput!) {
        fileUpdate(fileUrl: $file_url, input: $input) {
            file {
                id
                fileUrl
                alt
                description
                caption
                title
            }
            fileErrors {
                message
            }
        }
    }
`;

export const DELETE_MEDIA_IMAGE = gql`
    mutation DeleteFile($file_url: String!) {
        fileDelete(fileUrl: $file_url) {
            errors {
                message
            }
        }
    }
`;

export const GET_MEDIA_IMAGE = gql`
    query GetFileData($fileurl: String) {
        fileByFileurl(fileUrl: $fileurl) {
            alt
            caption
            description
            fileUrl
            title
            size
            createdAt
            updatedAt
        }
    }
`;

export const GET_DROP_SHIPPING = gql`
    query GetSheetSyncDetails($first: Int, $last: Int, $after: String, $before: String) {
        googlesheet(first: $first, last: $last, after: $after, before: $before) {
            edges {
                node {
                    id
                    firstRunTime
                    secondRunTime
                    sheetUrl
                    thirdRunTime
                }
            }
            pageInfo {
                endCursor
                hasNextPage
                hasPreviousPage
                startCursor
            }
            totalCount
        }
    }
`;

export const CREATE_DROP_SHIPPING = gql`
    mutation GoogleSheetScheduleCreate($input: GoogleSheetScheduleInput!) {
        googleSheetScheduleCreate(input: $input) {
            googleSheetSchedule {
                id
                sheetUrl
                firstRunTime
                secondRunTime
                thirdRunTime
            }
            errors {
                field
                message
                code
            }
        }
    }
`;

export const DELETE_DROP_SHIPPING = gql`
    mutation GsheetDelete($id: ID!) {
        googleSheetScheduleDelete(id: $id) {
            errors {
                field
                message
            }
        }
    }
`;

export const UPDATE_DROP_SHIPPING = gql`
    mutation GoogleSheetScheduleUpdate($id: ID!, $input: GoogleSheetScheduleInput!) {
        googleSheetScheduleUpdate(input: $input, id: $id) {
            googleSheetSchedule {
                id
                sheetUrl
                firstRunTime
                secondRunTime
                thirdRunTime
            }
            errors {
                field
                message
                code
            }
        }
    }
`;

export const IMPORT_DROP_SHIPPING = gql`
    mutation GSheetImport($id: ID!) {
        googlesheetimportnow(id: $id) {
            googleSheetSchedule {
                id
                sheetUrl
                firstRunTime
                secondRunTime
                thirdRunTime
            }
            errors {
                field
                message
                code
            }
        }
    }
`;

export const MEDIA_PAGINATION = gql`
    query PaginatedFiles($first: Int, $last: Int, $after: String, $before: String, $fileType: String!, $month: Int, $year: Int, $name: String!) {
        files(first: $first, last: $last, after: $after, before: $before, year: $year, name: $name, month: $month, fileType: $fileType) {
            edges {
                node {
                    alt
                    caption
                    description
                    fileUrl
                    id
                    title
                    createdAt
                    updatedAt
                }
            }
            pageInfo {
                hasNextPage
                hasPreviousPage
                endCursor
                startCursor
            }
        }
    }
`;
