export const transformVendorsListIntoFilter = (
  filters: Record<string, string[]>,
  vendorsList: string[]
) => {
  if (vendorsList.length === 0) {
    return filters
  }

  const 제조회사 = filters['제조회사'] ?? []
  filters['제조회사'] = [...제조회사, ...vendorsList]

  return filters
}
