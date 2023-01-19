// base-Product.find()
//bigQ-//search=coder&page=2&category=shortsleeves&rating[gte]=4
//&price[lte]=999&price[lte]=199

class WhereClause {
  constructor(base, bigQ) {
    (this.base = base), (this.bigQ = bigQ);
  }
  search() {
    //checking if bigQuery contains search
    const searchword = this.bigQ.search
      ? {
          name: {
            $regex: this.bigQ.search,
            $options: "i", //i is for case insensitivity and g is for global
          },
        }
      : {};
    this.base = this.base.find({ ...searchword });
    return this;
  }
  pager(resultsPerPage) {
    let currentPage = 1; //by default current page will be 1
    if (this.bigQ.page) {
      currentPage = this.bigQ.page;
    }
    let skippedValues = resultsPerPage * (currentPage - 1);
    this.base = this.base.limit(resultsPerPage).skip(skippedValues);
    return this;
  }
  filter() {
    const copyQ = { ...this.bigQ }; //because copyQ is being converted to string nad being manipulated further and we dont want to change bigQ to string
    delete copyQ["search"];
    delete copyQ["limit"];
    delete copyQ["page"];

    //converting bigQ to string=>copyQ
    let stringOfcopyQ = JSON.stringify(copyQ); //json to string
    stringOfcopyQ.replace(/\b(lte | gte | lt | gt)\b/g, (m) => `$${m}`);
    const jsonOfcopyQ = JSON.parse(stringOfcopyQ); //changing string to JSON
    this.base = this.base.find(jsonOfcopyQ);
    return this;
  }
}

module.exports = whereClause;
