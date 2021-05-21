"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheData = void 0;
const DbSet_1 = require("./Common/DbSet");
/** Stores system-wide cache data in a database to be shared across multiple website instances. */
let CacheData = class CacheData {
};
__decorate([
    key(),
    required(),
    maxLength(255)
], CacheData.prototype, "key", void 0);
__decorate([
    required(),
    DbSet_1.column()
], CacheData.prototype, "value", void 0);
__decorate([
    required(),
    DbSet_1.column()
], CacheData.prototype, "created", void 0);
__decorate([
    required(),
    DbSet_1.column()
], CacheData.prototype, "updated", void 0);
__decorate([
    DbSet_1.column()
], CacheData.prototype, "expires", void 0);
__decorate([
    DbSet_1.column()
], CacheData.prototype, "timeout", void 0);
CacheData = __decorate([
    DbSet_1.table("system_cache")
], CacheData);
exports.CacheData = CacheData;
//# sourceMappingURL=CacheData.js.map