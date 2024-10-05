import { useSetState } from '@/utils/functions';
import { useEffect } from 'react';
import Select from 'react-select';

export default function TagSelect({
    queryFunc,
    placeholder = 'Select tags',
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
        const data = res?.data.tags.edges;
        const pageInfo = res?.data.tags?.pageInfo;
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
            setState({ hasNext: false });
        }
    };

    const handleMenuScrollToBottom = async () => {
        if (state.hasNext) {
            productList(state.searchInput, state.after);
        }
    };

    const getProductSearch = async (inputValue) => {
        setState({ searchInput: inputValue, productOption: [], after: null });
        productList(inputValue);
    };

    const handleCategoryChange = (selected) => {
        onCategoryChange(selected);
        setState({ searchInput: '', productOption: [], hasNext: false, after: null });
        productList('');
    };

    return (
        <div>
            {title && (
                <label htmlFor="name" className="block text-lg font-medium text-gray-700">
                    {title}
                </label>
            )}
            <Select
                placeholder={loading ? 'Loading...' : placeholder}  // Show 'Loading...' in the placeholder
                options={state.productOption}
                value={selectedCategory}
                onChange={handleCategoryChange}
                isSearchable={true}
                isMulti={isMulti}
                isLoading={loading}  // Show a spinner when loading
                isDisabled={loading}  // Disable interaction when loading
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
