class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach(el => delete queryObj[el]);

    const filterObj = {};
    const standardMapping = {
      type: 'metadata.type',
      repo: 'metadata.repo_name',
      source: 'metadata.source_type',
      docType: 'metadata.doc_type',
      codeElement: 'metadata.code_element',
      isReadme: 'metadata.is_readme'
    };

    // 1. Handle special regex filters (language, framework, task, category)
    if (queryObj.language) {
      filterObj.$and = filterObj.$and || [];
      filterObj.$and.push({
        $or: [
          { 'metadata.source_type': new RegExp(queryObj.language, 'i') },
          { 'metadata.file_path': new RegExp('\\.' + queryObj.language + '$', 'i') },
          { instruction: new RegExp(queryObj.language, 'i') }
        ]
      });
      delete queryObj.language;
    }

    if (queryObj.framework) {
      filterObj.$and = filterObj.$and || [];
      filterObj.$and.push({
        $or: [
          { instruction: new RegExp(queryObj.framework, 'i') },
          { output: new RegExp(queryObj.framework, 'i') }
        ]
      });
      delete queryObj.framework;
    }

    if (queryObj.task) {
      filterObj.$and = filterObj.$and || [];
      filterObj.$and.push({
        $or: [
          { instruction: new RegExp(queryObj.task, 'i') },
          { output: new RegExp(queryObj.task, 'i') }
        ]
      });
      delete queryObj.task;
    }

    if (queryObj.category) {
      filterObj.$and = filterObj.$and || [];
      filterObj.$and.push({
        $or: [
          { 'metadata.type': new RegExp(queryObj.category, 'i') },
          { instruction: new RegExp(queryObj.category, 'i') }
        ]
      });
      delete queryObj.category;
    }

    // 2. Map standard fields and format values (booleans)
    Object.keys(queryObj).forEach(key => {
      const mappedKey = standardMapping[key] || key;
      let value = queryObj[key];
      if (value === 'true') {
        value = true;
      } else if (value === 'false') {
        value = false;
      }
      filterObj[mappedKey] = value;
    });

    this.query = this.query.find(filterObj);
    return this;
  }

  search() {
    if (this.queryString.search) {
      this.query = this.query.find({
        $text: { $search: this.queryString.search }
      });
    }
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const fieldMapping = {
        repo: 'metadata.repo_name',
        type: 'metadata.type',
        source: 'metadata.source_type',
        docType: 'metadata.doc_type',
        codeElement: 'metadata.code_element',
        isReadme: 'metadata.is_readme'
      };
      const sortBy = this.queryString.sort
        .split(',')
        .map(field => {
          const isDesc = field.startsWith('-');
          const cleanField = isDesc ? field.substring(1) : field;
          const mappedField = fieldMapping[cleanField] || cleanField;
          return isDesc ? `-${mappedField}` : mappedField;
        })
        .join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 20;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    this.page = page;
    this.limit = limit;
    return this;
  }
}

module.exports = APIFeatures;
