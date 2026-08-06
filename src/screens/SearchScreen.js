import SearchContent from "../components/search/SearchContent";

export default function SearchScreen({ route }) {
  return (
    <SearchContent
      initialQuery={route.params?.initialQuery ?? ""}
      initialFilters={route.params?.filters}
      categoryLabel={route.params?.categoryLabel}
    />
  );
}
