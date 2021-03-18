/** A database context instance that uses a 'DS.DB.DBAdapter' for working with the underlying data types.
 * Use the @table, @column, and @navigation decorators to help provide hints when working with the data (such as what table
 * name belongs to with class). The underlying database will be queried for any initial table structures prior to applying
 * the decorators.
 */
export class DbContext<T extends DS.DB.DBAdapter = DS.DB.DBAdapter> {
    db: T;
}