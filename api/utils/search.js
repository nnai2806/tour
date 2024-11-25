import slugify from "slugify";

export const slugSearch = (doc, search, fieldArray, req) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 9;
  const sortDirection = req.query.sort === "asc" ? 1 : -1;

  const normalizeString = (str) =>
    slugify(str, { replacement: "", lower: true, locale: "vi" });

  if (search) {
    const normalizedSearch = normalizeString(search);
    doc = doc.filter((item) => {
      return fieldArray.some((field) => {
        const fieldValue = item[field];
        if (fieldValue) {
          const normalizedFieldValue = normalizeString(fieldValue);
          return normalizedFieldValue.includes(normalizedSearch);
        }
        return false;
      });
    });
  }

  const sortedTours = doc
    .sort((a, b) => {
      if (sortDirection === 1) {
        return new Date(a.updatedAt) - new Date(b.updatedAt);
      } else {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      }
    })
    .slice(page * limit, (page + 1) * limit);

  return sortedTours;
};
