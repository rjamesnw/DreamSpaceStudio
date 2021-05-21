import { column, table } from "./Common/DbSet";

/** Stores system-wide cache data in a database to be shared across multiple website instances. */
@table("system_cache")
export class CacheData {
    @key()
    @required()
    @maxLength(255)
    key: string;

    @required()
    @column()
    value: Uint8Array;

    @required()
    @column()
    created: Date;

    @required()
    @column()
    updated: Date;

    @column()
    expires: Date;

    @column()
    timeout: number;
}
