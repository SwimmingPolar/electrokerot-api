export const transformVendorsListIntoFilter = (
  query: any,
  vendorsList: string[]
) => {
  return vendorsList.length !== 0
    ? (query['제조회사'].$in = [...query['제조회사'].$in].concat(
        vendorsList.map(vendor => new RegExp(vendor, 'i'))
      ))
    : query
}
