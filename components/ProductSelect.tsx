import { useSetState } from '@/utils/functions';
import { useEffect } from 'react';
import Select from 'react-select';

export default function ProductSelect({
    queryFunc,
    placeholder = 'Select Products',
    selectedCategory,
    onCategoryChange,
    initialFetchParams = { first: 20, channel: 'india-channel' },
    isMulti = true,
    clearable = true,
    title = '',
    loading = false,
}) {
    const [state, setState] = useSetState({
        productOption: [],
        hasNext: false,
        after: null,
        searchInput: '',
    });

    useEffect(() => {
        productList();
    }, []);

    const productList = async (search = '', after = null) => {
        const res = await queryFunc({ ...initialFetchParams, after, search });
        const pageInfo = res?.data?.products?.pageInfo;
        const data = res?.data?.products?.edges;
        if (data?.length > 0) {
            const result = data.map((item) => ({
                value: item.node.id,
                label: item.node.name,
            }));

            setState({
                productOption: after ? [...state.productOption, ...result] : result,
                hasNext: pageInfo?.hasNextPage,
                after: pageInfo?.endCursor,
            });
        } else {
            setState({ hasNext: false }); // No more data available
        }
    };

    const handleMenuScrollToBottom = async () => {
        if (state.hasNext) {
            productList(state.searchInput, state.after);
        }
    };

    const getProductSearch = async (inputValue) => {
        setState({ searchInput: inputValue, productOption: [], after: null }); // Reset options and after cursor
        productList(inputValue); // Fetch new search results
    };

    const handleCategoryChange = (selected) => {
        onCategoryChange(selected);
        setState({ searchInput: '', productOption: [], hasNext: false, after: null }); // Reset state after selection
        productList(''); // Load the default product list after selection
    };

    return (
        <div className="">
            {title && (
                <label htmlFor="name" className="block text-lg font-medium text-gray-700">
                    {title}
                </label>
            )}
            <Select
                placeholder={placeholder}
                options={state.productOption}
                value={selectedCategory}
                onChange={handleCategoryChange}
                isSearchable={true}
                isMulti={isMulti}
                isLoading={loading}
                onInputChange={(inputValue, { action }) => {
                    if (action === 'input-change') {
                        getProductSearch(inputValue);
                    }
                }}
                onMenuScrollToBottom={handleMenuScrollToBottom}
                isClearable={clearable}
                closeMenuOnSelect={!isMulti}
                blurInputOnSelect={false}
                styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    menu: (base) => ({ ...base, zIndex: 9999, maxHeight: '300px', overflowY: 'auto' }), // Enable scrolling
                }}
            />
        </div>
    );
}
