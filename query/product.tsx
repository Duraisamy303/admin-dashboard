import { gql } from '@apollo/client';

export const PRODUCT_LIST = gql`
    query ProductListPaginated($channel: String!, $first: Int!, $after: String) {
        products(first: $first, after: $after, channel: $channel) {
            totalCount
            edges {
                node {
                    ...ProductListItem
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
            __typename
        }
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

export const CATEGORY_LIST = gql`
    query CategoryList($first: Int!, $after: String, $channel: String!) {
        categories(first: $first, after: $after) {
            edges {
                node {
                    id
                    name
                    description
                    products(channel: $channel) {
                        totalCount
                    }
                }
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

export const ORDER_LIST = gql`
    query GetOrdersList {
        orders(first: 10) {
            edges {
                node {
                    id
                    total {
                        gross {
                            currency
                            amount
                        }
                    }
                    user {
                        email
                        firstName
                        lastName
                        id
                    }
                    updatedAt
                    number
                    paymentStatus
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

export const GET_ORDER_DETAILS = gql`
    query OrderDetailsWithMetadata($id: ID!, $isStaffUser: Boolean!) {
        order(id: $id) {
            ...OrderDetailsWithMetadata
            __typename
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
            }
            ...Product
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
    query TagList {
        tags(first: 100) {
            edges {
                node {
                    id
                    name
                }
            }
        }
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

export const PARENT_CATEGORY_LIST = gql`
    query MyQuery {
        categories(level: 0, first: 100) {
            edges {
                node {
                    id
                    name
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

export const CATEGORY_FILTER_LIST = gql`
query ProductListPaginated($channel: String!, $first: Int!, $after: String,$categoryId:[ID!]!) {
    products(
      filter: {categories: $categoryId}
      first: $first
      after: $after
      channel: $channel
      
    ) {
      totalCount
      edges {
        node {
          ...ProductListItem
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
      __typename
    }
    __typename
  }
`;
