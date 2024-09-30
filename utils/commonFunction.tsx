export const setBilling = async (customerAddress: any) => {
    try {
        let billing = {};
        if (customerAddress && customerAddress?.user) {
            if (customerAddress?.user?.defaultBillingAddress) {
                const billingId = customerAddress?.user?.defaultBillingAddress?.id;
                if (customerAddress?.user?.addresses?.length > 0) {
                    const filter = customerAddress?.user?.addresses?.find((item: any) => item.id == billingId);
                    let updatedPhone = filter.phone.replace('+91', '');
                    billing = {
                        firstName: filter.firstName,
                        lastName: filter.lastName,
                        company: filter?.companyName,
                        address_1: filter?.streetAddress1,
                        address_2: filter?.streetAddress2,
                        city: filter?.city,
                        state: filter.countryArea,
                        country: filter?.country?.code,
                        email: filter.email,
                        phone: updatedPhone,
                        paymentMethod: '',
                        transactionId: '',
                        countryArea: '',
                        pincode: filter.postalCode,
                    };
                }
            }
        }
        return billing;
    } catch (error) {
        console.log('error: ', error);
    }
};

export const setShipping = async (customerAddress: any) => {
    try {
        let shipping = {};
        if (customerAddress?.user?.defaultShippingAddress) {
            const billingId = customerAddress?.user?.defaultShippingAddress?.id;
            if (customerAddress?.user?.addresses?.length > 0) {
                const filter = customerAddress?.user?.addresses?.find((item: any) => item.id == billingId);
                let updatedPhone = filter.phone.replace('+91', '');

                shipping = {
                    firstName: filter.firstName,
                    lastName: filter.lastName,
                    company: filter?.companyName,
                    address_1: filter?.streetAddress1,
                    address_2: filter?.streetAddress2,
                    city: filter?.city,
                    state: filter.countryArea,
                    country: filter?.country?.code,
                    email: filter.email,
                    phone: updatedPhone,
                    paymentMethod: '',
                    transactionId: '',
                    countryArea: '',
                    pincode: filter.postalCode,
                };
            }
        }
        return shipping;
    } catch (error) {
        console.log('error: ', error);
    }
};

export const productsDropdown = (productData: any) => {
    if (productData) {
        if (productData.length > 0) {
            const list = productData?.map((item: any) => item?.node);
            // const dropdown: any = list.map((item: any) => ({ value: item?.id, label: item?.name }));
            return list;
        }
    }
};
