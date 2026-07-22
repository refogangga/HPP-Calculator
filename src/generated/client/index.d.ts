
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Outlet
 * 
 */
export type Outlet = $Result.DefaultSelection<Prisma.$OutletPayload>
/**
 * Model Menu
 * 
 */
export type Menu = $Result.DefaultSelection<Prisma.$MenuPayload>
/**
 * Model OpexProfile
 * 
 */
export type OpexProfile = $Result.DefaultSelection<Prisma.$OpexProfilePayload>
/**
 * Model BepSettings
 * 
 */
export type BepSettings = $Result.DefaultSelection<Prisma.$BepSettingsPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Outlets
 * const outlets = await prisma.outlet.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Outlets
   * const outlets = await prisma.outlet.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.outlet`: Exposes CRUD operations for the **Outlet** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Outlets
    * const outlets = await prisma.outlet.findMany()
    * ```
    */
  get outlet(): Prisma.OutletDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.menu`: Exposes CRUD operations for the **Menu** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Menus
    * const menus = await prisma.menu.findMany()
    * ```
    */
  get menu(): Prisma.MenuDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.opexProfile`: Exposes CRUD operations for the **OpexProfile** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OpexProfiles
    * const opexProfiles = await prisma.opexProfile.findMany()
    * ```
    */
  get opexProfile(): Prisma.OpexProfileDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.bepSettings`: Exposes CRUD operations for the **BepSettings** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more BepSettings
    * const bepSettings = await prisma.bepSettings.findMany()
    * ```
    */
  get bepSettings(): Prisma.BepSettingsDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.3
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Outlet: 'Outlet',
    Menu: 'Menu',
    OpexProfile: 'OpexProfile',
    BepSettings: 'BepSettings'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "outlet" | "menu" | "opexProfile" | "bepSettings"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Outlet: {
        payload: Prisma.$OutletPayload<ExtArgs>
        fields: Prisma.OutletFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OutletFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutletPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OutletFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutletPayload>
          }
          findFirst: {
            args: Prisma.OutletFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutletPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OutletFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutletPayload>
          }
          findMany: {
            args: Prisma.OutletFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutletPayload>[]
          }
          create: {
            args: Prisma.OutletCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutletPayload>
          }
          createMany: {
            args: Prisma.OutletCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.OutletDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutletPayload>
          }
          update: {
            args: Prisma.OutletUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutletPayload>
          }
          deleteMany: {
            args: Prisma.OutletDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OutletUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.OutletUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutletPayload>
          }
          aggregate: {
            args: Prisma.OutletAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOutlet>
          }
          groupBy: {
            args: Prisma.OutletGroupByArgs<ExtArgs>
            result: $Utils.Optional<OutletGroupByOutputType>[]
          }
          count: {
            args: Prisma.OutletCountArgs<ExtArgs>
            result: $Utils.Optional<OutletCountAggregateOutputType> | number
          }
        }
      }
      Menu: {
        payload: Prisma.$MenuPayload<ExtArgs>
        fields: Prisma.MenuFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MenuFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MenuPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MenuFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MenuPayload>
          }
          findFirst: {
            args: Prisma.MenuFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MenuPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MenuFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MenuPayload>
          }
          findMany: {
            args: Prisma.MenuFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MenuPayload>[]
          }
          create: {
            args: Prisma.MenuCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MenuPayload>
          }
          createMany: {
            args: Prisma.MenuCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.MenuDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MenuPayload>
          }
          update: {
            args: Prisma.MenuUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MenuPayload>
          }
          deleteMany: {
            args: Prisma.MenuDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MenuUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.MenuUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MenuPayload>
          }
          aggregate: {
            args: Prisma.MenuAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMenu>
          }
          groupBy: {
            args: Prisma.MenuGroupByArgs<ExtArgs>
            result: $Utils.Optional<MenuGroupByOutputType>[]
          }
          count: {
            args: Prisma.MenuCountArgs<ExtArgs>
            result: $Utils.Optional<MenuCountAggregateOutputType> | number
          }
        }
      }
      OpexProfile: {
        payload: Prisma.$OpexProfilePayload<ExtArgs>
        fields: Prisma.OpexProfileFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OpexProfileFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpexProfilePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OpexProfileFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpexProfilePayload>
          }
          findFirst: {
            args: Prisma.OpexProfileFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpexProfilePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OpexProfileFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpexProfilePayload>
          }
          findMany: {
            args: Prisma.OpexProfileFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpexProfilePayload>[]
          }
          create: {
            args: Prisma.OpexProfileCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpexProfilePayload>
          }
          createMany: {
            args: Prisma.OpexProfileCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.OpexProfileDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpexProfilePayload>
          }
          update: {
            args: Prisma.OpexProfileUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpexProfilePayload>
          }
          deleteMany: {
            args: Prisma.OpexProfileDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OpexProfileUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.OpexProfileUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpexProfilePayload>
          }
          aggregate: {
            args: Prisma.OpexProfileAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOpexProfile>
          }
          groupBy: {
            args: Prisma.OpexProfileGroupByArgs<ExtArgs>
            result: $Utils.Optional<OpexProfileGroupByOutputType>[]
          }
          count: {
            args: Prisma.OpexProfileCountArgs<ExtArgs>
            result: $Utils.Optional<OpexProfileCountAggregateOutputType> | number
          }
        }
      }
      BepSettings: {
        payload: Prisma.$BepSettingsPayload<ExtArgs>
        fields: Prisma.BepSettingsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BepSettingsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BepSettingsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BepSettingsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BepSettingsPayload>
          }
          findFirst: {
            args: Prisma.BepSettingsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BepSettingsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BepSettingsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BepSettingsPayload>
          }
          findMany: {
            args: Prisma.BepSettingsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BepSettingsPayload>[]
          }
          create: {
            args: Prisma.BepSettingsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BepSettingsPayload>
          }
          createMany: {
            args: Prisma.BepSettingsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.BepSettingsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BepSettingsPayload>
          }
          update: {
            args: Prisma.BepSettingsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BepSettingsPayload>
          }
          deleteMany: {
            args: Prisma.BepSettingsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BepSettingsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.BepSettingsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BepSettingsPayload>
          }
          aggregate: {
            args: Prisma.BepSettingsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBepSettings>
          }
          groupBy: {
            args: Prisma.BepSettingsGroupByArgs<ExtArgs>
            result: $Utils.Optional<BepSettingsGroupByOutputType>[]
          }
          count: {
            args: Prisma.BepSettingsCountArgs<ExtArgs>
            result: $Utils.Optional<BepSettingsCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    outlet?: OutletOmit
    menu?: MenuOmit
    opexProfile?: OpexProfileOmit
    bepSettings?: BepSettingsOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type OutletCountOutputType
   */

  export type OutletCountOutputType = {
    menus: number
    opexProfiles: number
  }

  export type OutletCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    menus?: boolean | OutletCountOutputTypeCountMenusArgs
    opexProfiles?: boolean | OutletCountOutputTypeCountOpexProfilesArgs
  }

  // Custom InputTypes
  /**
   * OutletCountOutputType without action
   */
  export type OutletCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutletCountOutputType
     */
    select?: OutletCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OutletCountOutputType without action
   */
  export type OutletCountOutputTypeCountMenusArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MenuWhereInput
  }

  /**
   * OutletCountOutputType without action
   */
  export type OutletCountOutputTypeCountOpexProfilesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OpexProfileWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Outlet
   */

  export type AggregateOutlet = {
    _count: OutletCountAggregateOutputType | null
    _min: OutletMinAggregateOutputType | null
    _max: OutletMaxAggregateOutputType | null
  }

  export type OutletMinAggregateOutputType = {
    id: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OutletMaxAggregateOutputType = {
    id: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OutletCountAggregateOutputType = {
    id: number
    name: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type OutletMinAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OutletMaxAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OutletCountAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type OutletAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Outlet to aggregate.
     */
    where?: OutletWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Outlets to fetch.
     */
    orderBy?: OutletOrderByWithRelationInput | OutletOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OutletWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Outlets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Outlets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Outlets
    **/
    _count?: true | OutletCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OutletMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OutletMaxAggregateInputType
  }

  export type GetOutletAggregateType<T extends OutletAggregateArgs> = {
        [P in keyof T & keyof AggregateOutlet]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOutlet[P]>
      : GetScalarType<T[P], AggregateOutlet[P]>
  }




  export type OutletGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OutletWhereInput
    orderBy?: OutletOrderByWithAggregationInput | OutletOrderByWithAggregationInput[]
    by: OutletScalarFieldEnum[] | OutletScalarFieldEnum
    having?: OutletScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OutletCountAggregateInputType | true
    _min?: OutletMinAggregateInputType
    _max?: OutletMaxAggregateInputType
  }

  export type OutletGroupByOutputType = {
    id: string
    name: string
    createdAt: Date
    updatedAt: Date
    _count: OutletCountAggregateOutputType | null
    _min: OutletMinAggregateOutputType | null
    _max: OutletMaxAggregateOutputType | null
  }

  type GetOutletGroupByPayload<T extends OutletGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OutletGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OutletGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OutletGroupByOutputType[P]>
            : GetScalarType<T[P], OutletGroupByOutputType[P]>
        }
      >
    >


  export type OutletSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    menus?: boolean | Outlet$menusArgs<ExtArgs>
    opexProfiles?: boolean | Outlet$opexProfilesArgs<ExtArgs>
    bepSettings?: boolean | Outlet$bepSettingsArgs<ExtArgs>
    _count?: boolean | OutletCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["outlet"]>



  export type OutletSelectScalar = {
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type OutletOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "createdAt" | "updatedAt", ExtArgs["result"]["outlet"]>
  export type OutletInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    menus?: boolean | Outlet$menusArgs<ExtArgs>
    opexProfiles?: boolean | Outlet$opexProfilesArgs<ExtArgs>
    bepSettings?: boolean | Outlet$bepSettingsArgs<ExtArgs>
    _count?: boolean | OutletCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $OutletPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Outlet"
    objects: {
      menus: Prisma.$MenuPayload<ExtArgs>[]
      opexProfiles: Prisma.$OpexProfilePayload<ExtArgs>[]
      bepSettings: Prisma.$BepSettingsPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["outlet"]>
    composites: {}
  }

  type OutletGetPayload<S extends boolean | null | undefined | OutletDefaultArgs> = $Result.GetResult<Prisma.$OutletPayload, S>

  type OutletCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OutletFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OutletCountAggregateInputType | true
    }

  export interface OutletDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Outlet'], meta: { name: 'Outlet' } }
    /**
     * Find zero or one Outlet that matches the filter.
     * @param {OutletFindUniqueArgs} args - Arguments to find a Outlet
     * @example
     * // Get one Outlet
     * const outlet = await prisma.outlet.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OutletFindUniqueArgs>(args: SelectSubset<T, OutletFindUniqueArgs<ExtArgs>>): Prisma__OutletClient<$Result.GetResult<Prisma.$OutletPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Outlet that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OutletFindUniqueOrThrowArgs} args - Arguments to find a Outlet
     * @example
     * // Get one Outlet
     * const outlet = await prisma.outlet.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OutletFindUniqueOrThrowArgs>(args: SelectSubset<T, OutletFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OutletClient<$Result.GetResult<Prisma.$OutletPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Outlet that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutletFindFirstArgs} args - Arguments to find a Outlet
     * @example
     * // Get one Outlet
     * const outlet = await prisma.outlet.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OutletFindFirstArgs>(args?: SelectSubset<T, OutletFindFirstArgs<ExtArgs>>): Prisma__OutletClient<$Result.GetResult<Prisma.$OutletPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Outlet that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutletFindFirstOrThrowArgs} args - Arguments to find a Outlet
     * @example
     * // Get one Outlet
     * const outlet = await prisma.outlet.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OutletFindFirstOrThrowArgs>(args?: SelectSubset<T, OutletFindFirstOrThrowArgs<ExtArgs>>): Prisma__OutletClient<$Result.GetResult<Prisma.$OutletPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Outlets that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutletFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Outlets
     * const outlets = await prisma.outlet.findMany()
     * 
     * // Get first 10 Outlets
     * const outlets = await prisma.outlet.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const outletWithIdOnly = await prisma.outlet.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OutletFindManyArgs>(args?: SelectSubset<T, OutletFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutletPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Outlet.
     * @param {OutletCreateArgs} args - Arguments to create a Outlet.
     * @example
     * // Create one Outlet
     * const Outlet = await prisma.outlet.create({
     *   data: {
     *     // ... data to create a Outlet
     *   }
     * })
     * 
     */
    create<T extends OutletCreateArgs>(args: SelectSubset<T, OutletCreateArgs<ExtArgs>>): Prisma__OutletClient<$Result.GetResult<Prisma.$OutletPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Outlets.
     * @param {OutletCreateManyArgs} args - Arguments to create many Outlets.
     * @example
     * // Create many Outlets
     * const outlet = await prisma.outlet.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OutletCreateManyArgs>(args?: SelectSubset<T, OutletCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Outlet.
     * @param {OutletDeleteArgs} args - Arguments to delete one Outlet.
     * @example
     * // Delete one Outlet
     * const Outlet = await prisma.outlet.delete({
     *   where: {
     *     // ... filter to delete one Outlet
     *   }
     * })
     * 
     */
    delete<T extends OutletDeleteArgs>(args: SelectSubset<T, OutletDeleteArgs<ExtArgs>>): Prisma__OutletClient<$Result.GetResult<Prisma.$OutletPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Outlet.
     * @param {OutletUpdateArgs} args - Arguments to update one Outlet.
     * @example
     * // Update one Outlet
     * const outlet = await prisma.outlet.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OutletUpdateArgs>(args: SelectSubset<T, OutletUpdateArgs<ExtArgs>>): Prisma__OutletClient<$Result.GetResult<Prisma.$OutletPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Outlets.
     * @param {OutletDeleteManyArgs} args - Arguments to filter Outlets to delete.
     * @example
     * // Delete a few Outlets
     * const { count } = await prisma.outlet.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OutletDeleteManyArgs>(args?: SelectSubset<T, OutletDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Outlets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutletUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Outlets
     * const outlet = await prisma.outlet.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OutletUpdateManyArgs>(args: SelectSubset<T, OutletUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Outlet.
     * @param {OutletUpsertArgs} args - Arguments to update or create a Outlet.
     * @example
     * // Update or create a Outlet
     * const outlet = await prisma.outlet.upsert({
     *   create: {
     *     // ... data to create a Outlet
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Outlet we want to update
     *   }
     * })
     */
    upsert<T extends OutletUpsertArgs>(args: SelectSubset<T, OutletUpsertArgs<ExtArgs>>): Prisma__OutletClient<$Result.GetResult<Prisma.$OutletPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Outlets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutletCountArgs} args - Arguments to filter Outlets to count.
     * @example
     * // Count the number of Outlets
     * const count = await prisma.outlet.count({
     *   where: {
     *     // ... the filter for the Outlets we want to count
     *   }
     * })
    **/
    count<T extends OutletCountArgs>(
      args?: Subset<T, OutletCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OutletCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Outlet.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutletAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OutletAggregateArgs>(args: Subset<T, OutletAggregateArgs>): Prisma.PrismaPromise<GetOutletAggregateType<T>>

    /**
     * Group by Outlet.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutletGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OutletGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OutletGroupByArgs['orderBy'] }
        : { orderBy?: OutletGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OutletGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOutletGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Outlet model
   */
  readonly fields: OutletFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Outlet.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OutletClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    menus<T extends Outlet$menusArgs<ExtArgs> = {}>(args?: Subset<T, Outlet$menusArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MenuPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    opexProfiles<T extends Outlet$opexProfilesArgs<ExtArgs> = {}>(args?: Subset<T, Outlet$opexProfilesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OpexProfilePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    bepSettings<T extends Outlet$bepSettingsArgs<ExtArgs> = {}>(args?: Subset<T, Outlet$bepSettingsArgs<ExtArgs>>): Prisma__BepSettingsClient<$Result.GetResult<Prisma.$BepSettingsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Outlet model
   */
  interface OutletFieldRefs {
    readonly id: FieldRef<"Outlet", 'String'>
    readonly name: FieldRef<"Outlet", 'String'>
    readonly createdAt: FieldRef<"Outlet", 'DateTime'>
    readonly updatedAt: FieldRef<"Outlet", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Outlet findUnique
   */
  export type OutletFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outlet
     */
    select?: OutletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outlet
     */
    omit?: OutletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutletInclude<ExtArgs> | null
    /**
     * Filter, which Outlet to fetch.
     */
    where: OutletWhereUniqueInput
  }

  /**
   * Outlet findUniqueOrThrow
   */
  export type OutletFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outlet
     */
    select?: OutletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outlet
     */
    omit?: OutletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutletInclude<ExtArgs> | null
    /**
     * Filter, which Outlet to fetch.
     */
    where: OutletWhereUniqueInput
  }

  /**
   * Outlet findFirst
   */
  export type OutletFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outlet
     */
    select?: OutletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outlet
     */
    omit?: OutletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutletInclude<ExtArgs> | null
    /**
     * Filter, which Outlet to fetch.
     */
    where?: OutletWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Outlets to fetch.
     */
    orderBy?: OutletOrderByWithRelationInput | OutletOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Outlets.
     */
    cursor?: OutletWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Outlets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Outlets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Outlets.
     */
    distinct?: OutletScalarFieldEnum | OutletScalarFieldEnum[]
  }

  /**
   * Outlet findFirstOrThrow
   */
  export type OutletFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outlet
     */
    select?: OutletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outlet
     */
    omit?: OutletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutletInclude<ExtArgs> | null
    /**
     * Filter, which Outlet to fetch.
     */
    where?: OutletWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Outlets to fetch.
     */
    orderBy?: OutletOrderByWithRelationInput | OutletOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Outlets.
     */
    cursor?: OutletWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Outlets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Outlets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Outlets.
     */
    distinct?: OutletScalarFieldEnum | OutletScalarFieldEnum[]
  }

  /**
   * Outlet findMany
   */
  export type OutletFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outlet
     */
    select?: OutletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outlet
     */
    omit?: OutletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutletInclude<ExtArgs> | null
    /**
     * Filter, which Outlets to fetch.
     */
    where?: OutletWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Outlets to fetch.
     */
    orderBy?: OutletOrderByWithRelationInput | OutletOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Outlets.
     */
    cursor?: OutletWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Outlets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Outlets.
     */
    skip?: number
    distinct?: OutletScalarFieldEnum | OutletScalarFieldEnum[]
  }

  /**
   * Outlet create
   */
  export type OutletCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outlet
     */
    select?: OutletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outlet
     */
    omit?: OutletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutletInclude<ExtArgs> | null
    /**
     * The data needed to create a Outlet.
     */
    data: XOR<OutletCreateInput, OutletUncheckedCreateInput>
  }

  /**
   * Outlet createMany
   */
  export type OutletCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Outlets.
     */
    data: OutletCreateManyInput | OutletCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Outlet update
   */
  export type OutletUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outlet
     */
    select?: OutletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outlet
     */
    omit?: OutletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutletInclude<ExtArgs> | null
    /**
     * The data needed to update a Outlet.
     */
    data: XOR<OutletUpdateInput, OutletUncheckedUpdateInput>
    /**
     * Choose, which Outlet to update.
     */
    where: OutletWhereUniqueInput
  }

  /**
   * Outlet updateMany
   */
  export type OutletUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Outlets.
     */
    data: XOR<OutletUpdateManyMutationInput, OutletUncheckedUpdateManyInput>
    /**
     * Filter which Outlets to update
     */
    where?: OutletWhereInput
    /**
     * Limit how many Outlets to update.
     */
    limit?: number
  }

  /**
   * Outlet upsert
   */
  export type OutletUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outlet
     */
    select?: OutletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outlet
     */
    omit?: OutletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutletInclude<ExtArgs> | null
    /**
     * The filter to search for the Outlet to update in case it exists.
     */
    where: OutletWhereUniqueInput
    /**
     * In case the Outlet found by the `where` argument doesn't exist, create a new Outlet with this data.
     */
    create: XOR<OutletCreateInput, OutletUncheckedCreateInput>
    /**
     * In case the Outlet was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OutletUpdateInput, OutletUncheckedUpdateInput>
  }

  /**
   * Outlet delete
   */
  export type OutletDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outlet
     */
    select?: OutletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outlet
     */
    omit?: OutletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutletInclude<ExtArgs> | null
    /**
     * Filter which Outlet to delete.
     */
    where: OutletWhereUniqueInput
  }

  /**
   * Outlet deleteMany
   */
  export type OutletDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Outlets to delete
     */
    where?: OutletWhereInput
    /**
     * Limit how many Outlets to delete.
     */
    limit?: number
  }

  /**
   * Outlet.menus
   */
  export type Outlet$menusArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Menu
     */
    select?: MenuSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Menu
     */
    omit?: MenuOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MenuInclude<ExtArgs> | null
    where?: MenuWhereInput
    orderBy?: MenuOrderByWithRelationInput | MenuOrderByWithRelationInput[]
    cursor?: MenuWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MenuScalarFieldEnum | MenuScalarFieldEnum[]
  }

  /**
   * Outlet.opexProfiles
   */
  export type Outlet$opexProfilesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OpexProfile
     */
    select?: OpexProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OpexProfile
     */
    omit?: OpexProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OpexProfileInclude<ExtArgs> | null
    where?: OpexProfileWhereInput
    orderBy?: OpexProfileOrderByWithRelationInput | OpexProfileOrderByWithRelationInput[]
    cursor?: OpexProfileWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OpexProfileScalarFieldEnum | OpexProfileScalarFieldEnum[]
  }

  /**
   * Outlet.bepSettings
   */
  export type Outlet$bepSettingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BepSettings
     */
    select?: BepSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BepSettings
     */
    omit?: BepSettingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BepSettingsInclude<ExtArgs> | null
    where?: BepSettingsWhereInput
  }

  /**
   * Outlet without action
   */
  export type OutletDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outlet
     */
    select?: OutletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outlet
     */
    omit?: OutletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutletInclude<ExtArgs> | null
  }


  /**
   * Model Menu
   */

  export type AggregateMenu = {
    _count: MenuCountAggregateOutputType | null
    _avg: MenuAvgAggregateOutputType | null
    _sum: MenuSumAggregateOutputType | null
    _min: MenuMinAggregateOutputType | null
    _max: MenuMaxAggregateOutputType | null
  }

  export type MenuAvgAggregateOutputType = {
    margin: number | null
  }

  export type MenuSumAggregateOutputType = {
    margin: number | null
  }

  export type MenuMinAggregateOutputType = {
    id: string | null
    name: string | null
    emoji: string | null
    category: string | null
    margin: number | null
    outletId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MenuMaxAggregateOutputType = {
    id: string | null
    name: string | null
    emoji: string | null
    category: string | null
    margin: number | null
    outletId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MenuCountAggregateOutputType = {
    id: number
    name: number
    emoji: number
    category: number
    margin: number
    ingredients: number
    packaging: number
    ops: number
    outletId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type MenuAvgAggregateInputType = {
    margin?: true
  }

  export type MenuSumAggregateInputType = {
    margin?: true
  }

  export type MenuMinAggregateInputType = {
    id?: true
    name?: true
    emoji?: true
    category?: true
    margin?: true
    outletId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MenuMaxAggregateInputType = {
    id?: true
    name?: true
    emoji?: true
    category?: true
    margin?: true
    outletId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MenuCountAggregateInputType = {
    id?: true
    name?: true
    emoji?: true
    category?: true
    margin?: true
    ingredients?: true
    packaging?: true
    ops?: true
    outletId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type MenuAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Menu to aggregate.
     */
    where?: MenuWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Menus to fetch.
     */
    orderBy?: MenuOrderByWithRelationInput | MenuOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MenuWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Menus from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Menus.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Menus
    **/
    _count?: true | MenuCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MenuAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MenuSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MenuMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MenuMaxAggregateInputType
  }

  export type GetMenuAggregateType<T extends MenuAggregateArgs> = {
        [P in keyof T & keyof AggregateMenu]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMenu[P]>
      : GetScalarType<T[P], AggregateMenu[P]>
  }




  export type MenuGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MenuWhereInput
    orderBy?: MenuOrderByWithAggregationInput | MenuOrderByWithAggregationInput[]
    by: MenuScalarFieldEnum[] | MenuScalarFieldEnum
    having?: MenuScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MenuCountAggregateInputType | true
    _avg?: MenuAvgAggregateInputType
    _sum?: MenuSumAggregateInputType
    _min?: MenuMinAggregateInputType
    _max?: MenuMaxAggregateInputType
  }

  export type MenuGroupByOutputType = {
    id: string
    name: string
    emoji: string
    category: string
    margin: number
    ingredients: JsonValue
    packaging: JsonValue
    ops: JsonValue | null
    outletId: string | null
    createdAt: Date
    updatedAt: Date
    _count: MenuCountAggregateOutputType | null
    _avg: MenuAvgAggregateOutputType | null
    _sum: MenuSumAggregateOutputType | null
    _min: MenuMinAggregateOutputType | null
    _max: MenuMaxAggregateOutputType | null
  }

  type GetMenuGroupByPayload<T extends MenuGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MenuGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MenuGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MenuGroupByOutputType[P]>
            : GetScalarType<T[P], MenuGroupByOutputType[P]>
        }
      >
    >


  export type MenuSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    emoji?: boolean
    category?: boolean
    margin?: boolean
    ingredients?: boolean
    packaging?: boolean
    ops?: boolean
    outletId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    outlet?: boolean | Menu$outletArgs<ExtArgs>
  }, ExtArgs["result"]["menu"]>



  export type MenuSelectScalar = {
    id?: boolean
    name?: boolean
    emoji?: boolean
    category?: boolean
    margin?: boolean
    ingredients?: boolean
    packaging?: boolean
    ops?: boolean
    outletId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type MenuOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "emoji" | "category" | "margin" | "ingredients" | "packaging" | "ops" | "outletId" | "createdAt" | "updatedAt", ExtArgs["result"]["menu"]>
  export type MenuInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    outlet?: boolean | Menu$outletArgs<ExtArgs>
  }

  export type $MenuPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Menu"
    objects: {
      outlet: Prisma.$OutletPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      emoji: string
      category: string
      margin: number
      ingredients: Prisma.JsonValue
      packaging: Prisma.JsonValue
      ops: Prisma.JsonValue | null
      outletId: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["menu"]>
    composites: {}
  }

  type MenuGetPayload<S extends boolean | null | undefined | MenuDefaultArgs> = $Result.GetResult<Prisma.$MenuPayload, S>

  type MenuCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MenuFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MenuCountAggregateInputType | true
    }

  export interface MenuDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Menu'], meta: { name: 'Menu' } }
    /**
     * Find zero or one Menu that matches the filter.
     * @param {MenuFindUniqueArgs} args - Arguments to find a Menu
     * @example
     * // Get one Menu
     * const menu = await prisma.menu.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MenuFindUniqueArgs>(args: SelectSubset<T, MenuFindUniqueArgs<ExtArgs>>): Prisma__MenuClient<$Result.GetResult<Prisma.$MenuPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Menu that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MenuFindUniqueOrThrowArgs} args - Arguments to find a Menu
     * @example
     * // Get one Menu
     * const menu = await prisma.menu.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MenuFindUniqueOrThrowArgs>(args: SelectSubset<T, MenuFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MenuClient<$Result.GetResult<Prisma.$MenuPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Menu that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MenuFindFirstArgs} args - Arguments to find a Menu
     * @example
     * // Get one Menu
     * const menu = await prisma.menu.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MenuFindFirstArgs>(args?: SelectSubset<T, MenuFindFirstArgs<ExtArgs>>): Prisma__MenuClient<$Result.GetResult<Prisma.$MenuPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Menu that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MenuFindFirstOrThrowArgs} args - Arguments to find a Menu
     * @example
     * // Get one Menu
     * const menu = await prisma.menu.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MenuFindFirstOrThrowArgs>(args?: SelectSubset<T, MenuFindFirstOrThrowArgs<ExtArgs>>): Prisma__MenuClient<$Result.GetResult<Prisma.$MenuPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Menus that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MenuFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Menus
     * const menus = await prisma.menu.findMany()
     * 
     * // Get first 10 Menus
     * const menus = await prisma.menu.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const menuWithIdOnly = await prisma.menu.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MenuFindManyArgs>(args?: SelectSubset<T, MenuFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MenuPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Menu.
     * @param {MenuCreateArgs} args - Arguments to create a Menu.
     * @example
     * // Create one Menu
     * const Menu = await prisma.menu.create({
     *   data: {
     *     // ... data to create a Menu
     *   }
     * })
     * 
     */
    create<T extends MenuCreateArgs>(args: SelectSubset<T, MenuCreateArgs<ExtArgs>>): Prisma__MenuClient<$Result.GetResult<Prisma.$MenuPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Menus.
     * @param {MenuCreateManyArgs} args - Arguments to create many Menus.
     * @example
     * // Create many Menus
     * const menu = await prisma.menu.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MenuCreateManyArgs>(args?: SelectSubset<T, MenuCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Menu.
     * @param {MenuDeleteArgs} args - Arguments to delete one Menu.
     * @example
     * // Delete one Menu
     * const Menu = await prisma.menu.delete({
     *   where: {
     *     // ... filter to delete one Menu
     *   }
     * })
     * 
     */
    delete<T extends MenuDeleteArgs>(args: SelectSubset<T, MenuDeleteArgs<ExtArgs>>): Prisma__MenuClient<$Result.GetResult<Prisma.$MenuPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Menu.
     * @param {MenuUpdateArgs} args - Arguments to update one Menu.
     * @example
     * // Update one Menu
     * const menu = await prisma.menu.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MenuUpdateArgs>(args: SelectSubset<T, MenuUpdateArgs<ExtArgs>>): Prisma__MenuClient<$Result.GetResult<Prisma.$MenuPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Menus.
     * @param {MenuDeleteManyArgs} args - Arguments to filter Menus to delete.
     * @example
     * // Delete a few Menus
     * const { count } = await prisma.menu.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MenuDeleteManyArgs>(args?: SelectSubset<T, MenuDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Menus.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MenuUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Menus
     * const menu = await prisma.menu.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MenuUpdateManyArgs>(args: SelectSubset<T, MenuUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Menu.
     * @param {MenuUpsertArgs} args - Arguments to update or create a Menu.
     * @example
     * // Update or create a Menu
     * const menu = await prisma.menu.upsert({
     *   create: {
     *     // ... data to create a Menu
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Menu we want to update
     *   }
     * })
     */
    upsert<T extends MenuUpsertArgs>(args: SelectSubset<T, MenuUpsertArgs<ExtArgs>>): Prisma__MenuClient<$Result.GetResult<Prisma.$MenuPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Menus.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MenuCountArgs} args - Arguments to filter Menus to count.
     * @example
     * // Count the number of Menus
     * const count = await prisma.menu.count({
     *   where: {
     *     // ... the filter for the Menus we want to count
     *   }
     * })
    **/
    count<T extends MenuCountArgs>(
      args?: Subset<T, MenuCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MenuCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Menu.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MenuAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MenuAggregateArgs>(args: Subset<T, MenuAggregateArgs>): Prisma.PrismaPromise<GetMenuAggregateType<T>>

    /**
     * Group by Menu.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MenuGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MenuGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MenuGroupByArgs['orderBy'] }
        : { orderBy?: MenuGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MenuGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMenuGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Menu model
   */
  readonly fields: MenuFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Menu.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MenuClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    outlet<T extends Menu$outletArgs<ExtArgs> = {}>(args?: Subset<T, Menu$outletArgs<ExtArgs>>): Prisma__OutletClient<$Result.GetResult<Prisma.$OutletPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Menu model
   */
  interface MenuFieldRefs {
    readonly id: FieldRef<"Menu", 'String'>
    readonly name: FieldRef<"Menu", 'String'>
    readonly emoji: FieldRef<"Menu", 'String'>
    readonly category: FieldRef<"Menu", 'String'>
    readonly margin: FieldRef<"Menu", 'Float'>
    readonly ingredients: FieldRef<"Menu", 'Json'>
    readonly packaging: FieldRef<"Menu", 'Json'>
    readonly ops: FieldRef<"Menu", 'Json'>
    readonly outletId: FieldRef<"Menu", 'String'>
    readonly createdAt: FieldRef<"Menu", 'DateTime'>
    readonly updatedAt: FieldRef<"Menu", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Menu findUnique
   */
  export type MenuFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Menu
     */
    select?: MenuSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Menu
     */
    omit?: MenuOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MenuInclude<ExtArgs> | null
    /**
     * Filter, which Menu to fetch.
     */
    where: MenuWhereUniqueInput
  }

  /**
   * Menu findUniqueOrThrow
   */
  export type MenuFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Menu
     */
    select?: MenuSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Menu
     */
    omit?: MenuOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MenuInclude<ExtArgs> | null
    /**
     * Filter, which Menu to fetch.
     */
    where: MenuWhereUniqueInput
  }

  /**
   * Menu findFirst
   */
  export type MenuFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Menu
     */
    select?: MenuSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Menu
     */
    omit?: MenuOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MenuInclude<ExtArgs> | null
    /**
     * Filter, which Menu to fetch.
     */
    where?: MenuWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Menus to fetch.
     */
    orderBy?: MenuOrderByWithRelationInput | MenuOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Menus.
     */
    cursor?: MenuWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Menus from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Menus.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Menus.
     */
    distinct?: MenuScalarFieldEnum | MenuScalarFieldEnum[]
  }

  /**
   * Menu findFirstOrThrow
   */
  export type MenuFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Menu
     */
    select?: MenuSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Menu
     */
    omit?: MenuOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MenuInclude<ExtArgs> | null
    /**
     * Filter, which Menu to fetch.
     */
    where?: MenuWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Menus to fetch.
     */
    orderBy?: MenuOrderByWithRelationInput | MenuOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Menus.
     */
    cursor?: MenuWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Menus from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Menus.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Menus.
     */
    distinct?: MenuScalarFieldEnum | MenuScalarFieldEnum[]
  }

  /**
   * Menu findMany
   */
  export type MenuFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Menu
     */
    select?: MenuSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Menu
     */
    omit?: MenuOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MenuInclude<ExtArgs> | null
    /**
     * Filter, which Menus to fetch.
     */
    where?: MenuWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Menus to fetch.
     */
    orderBy?: MenuOrderByWithRelationInput | MenuOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Menus.
     */
    cursor?: MenuWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Menus from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Menus.
     */
    skip?: number
    distinct?: MenuScalarFieldEnum | MenuScalarFieldEnum[]
  }

  /**
   * Menu create
   */
  export type MenuCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Menu
     */
    select?: MenuSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Menu
     */
    omit?: MenuOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MenuInclude<ExtArgs> | null
    /**
     * The data needed to create a Menu.
     */
    data: XOR<MenuCreateInput, MenuUncheckedCreateInput>
  }

  /**
   * Menu createMany
   */
  export type MenuCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Menus.
     */
    data: MenuCreateManyInput | MenuCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Menu update
   */
  export type MenuUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Menu
     */
    select?: MenuSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Menu
     */
    omit?: MenuOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MenuInclude<ExtArgs> | null
    /**
     * The data needed to update a Menu.
     */
    data: XOR<MenuUpdateInput, MenuUncheckedUpdateInput>
    /**
     * Choose, which Menu to update.
     */
    where: MenuWhereUniqueInput
  }

  /**
   * Menu updateMany
   */
  export type MenuUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Menus.
     */
    data: XOR<MenuUpdateManyMutationInput, MenuUncheckedUpdateManyInput>
    /**
     * Filter which Menus to update
     */
    where?: MenuWhereInput
    /**
     * Limit how many Menus to update.
     */
    limit?: number
  }

  /**
   * Menu upsert
   */
  export type MenuUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Menu
     */
    select?: MenuSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Menu
     */
    omit?: MenuOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MenuInclude<ExtArgs> | null
    /**
     * The filter to search for the Menu to update in case it exists.
     */
    where: MenuWhereUniqueInput
    /**
     * In case the Menu found by the `where` argument doesn't exist, create a new Menu with this data.
     */
    create: XOR<MenuCreateInput, MenuUncheckedCreateInput>
    /**
     * In case the Menu was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MenuUpdateInput, MenuUncheckedUpdateInput>
  }

  /**
   * Menu delete
   */
  export type MenuDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Menu
     */
    select?: MenuSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Menu
     */
    omit?: MenuOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MenuInclude<ExtArgs> | null
    /**
     * Filter which Menu to delete.
     */
    where: MenuWhereUniqueInput
  }

  /**
   * Menu deleteMany
   */
  export type MenuDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Menus to delete
     */
    where?: MenuWhereInput
    /**
     * Limit how many Menus to delete.
     */
    limit?: number
  }

  /**
   * Menu.outlet
   */
  export type Menu$outletArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outlet
     */
    select?: OutletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outlet
     */
    omit?: OutletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutletInclude<ExtArgs> | null
    where?: OutletWhereInput
  }

  /**
   * Menu without action
   */
  export type MenuDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Menu
     */
    select?: MenuSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Menu
     */
    omit?: MenuOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MenuInclude<ExtArgs> | null
  }


  /**
   * Model OpexProfile
   */

  export type AggregateOpexProfile = {
    _count: OpexProfileCountAggregateOutputType | null
    _avg: OpexProfileAvgAggregateOutputType | null
    _sum: OpexProfileSumAggregateOutputType | null
    _min: OpexProfileMinAggregateOutputType | null
    _max: OpexProfileMaxAggregateOutputType | null
  }

  export type OpexProfileAvgAggregateOutputType = {
    penyusutan: number | null
    totalVolume: number | null
  }

  export type OpexProfileSumAggregateOutputType = {
    penyusutan: number | null
    totalVolume: number | null
  }

  export type OpexProfileMinAggregateOutputType = {
    id: string | null
    name: string | null
    usePenyusutan: boolean | null
    penyusutan: number | null
    isTotalVolumeLocked: boolean | null
    totalVolume: number | null
    outletId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OpexProfileMaxAggregateOutputType = {
    id: string | null
    name: string | null
    usePenyusutan: boolean | null
    penyusutan: number | null
    isTotalVolumeLocked: boolean | null
    totalVolume: number | null
    outletId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OpexProfileCountAggregateOutputType = {
    id: number
    name: number
    usePenyusutan: number
    penyusutan: number
    isTotalVolumeLocked: number
    totalVolume: number
    menuVolumes: number
    menuPrices: number
    selectedMenuIds: number
    assets: number
    expenses: number
    outletId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type OpexProfileAvgAggregateInputType = {
    penyusutan?: true
    totalVolume?: true
  }

  export type OpexProfileSumAggregateInputType = {
    penyusutan?: true
    totalVolume?: true
  }

  export type OpexProfileMinAggregateInputType = {
    id?: true
    name?: true
    usePenyusutan?: true
    penyusutan?: true
    isTotalVolumeLocked?: true
    totalVolume?: true
    outletId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OpexProfileMaxAggregateInputType = {
    id?: true
    name?: true
    usePenyusutan?: true
    penyusutan?: true
    isTotalVolumeLocked?: true
    totalVolume?: true
    outletId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OpexProfileCountAggregateInputType = {
    id?: true
    name?: true
    usePenyusutan?: true
    penyusutan?: true
    isTotalVolumeLocked?: true
    totalVolume?: true
    menuVolumes?: true
    menuPrices?: true
    selectedMenuIds?: true
    assets?: true
    expenses?: true
    outletId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type OpexProfileAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OpexProfile to aggregate.
     */
    where?: OpexProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OpexProfiles to fetch.
     */
    orderBy?: OpexProfileOrderByWithRelationInput | OpexProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OpexProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OpexProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OpexProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OpexProfiles
    **/
    _count?: true | OpexProfileCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OpexProfileAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OpexProfileSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OpexProfileMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OpexProfileMaxAggregateInputType
  }

  export type GetOpexProfileAggregateType<T extends OpexProfileAggregateArgs> = {
        [P in keyof T & keyof AggregateOpexProfile]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOpexProfile[P]>
      : GetScalarType<T[P], AggregateOpexProfile[P]>
  }




  export type OpexProfileGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OpexProfileWhereInput
    orderBy?: OpexProfileOrderByWithAggregationInput | OpexProfileOrderByWithAggregationInput[]
    by: OpexProfileScalarFieldEnum[] | OpexProfileScalarFieldEnum
    having?: OpexProfileScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OpexProfileCountAggregateInputType | true
    _avg?: OpexProfileAvgAggregateInputType
    _sum?: OpexProfileSumAggregateInputType
    _min?: OpexProfileMinAggregateInputType
    _max?: OpexProfileMaxAggregateInputType
  }

  export type OpexProfileGroupByOutputType = {
    id: string
    name: string
    usePenyusutan: boolean
    penyusutan: number
    isTotalVolumeLocked: boolean
    totalVolume: number
    menuVolumes: JsonValue
    menuPrices: JsonValue
    selectedMenuIds: JsonValue
    assets: JsonValue
    expenses: JsonValue
    outletId: string | null
    createdAt: Date
    updatedAt: Date
    _count: OpexProfileCountAggregateOutputType | null
    _avg: OpexProfileAvgAggregateOutputType | null
    _sum: OpexProfileSumAggregateOutputType | null
    _min: OpexProfileMinAggregateOutputType | null
    _max: OpexProfileMaxAggregateOutputType | null
  }

  type GetOpexProfileGroupByPayload<T extends OpexProfileGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OpexProfileGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OpexProfileGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OpexProfileGroupByOutputType[P]>
            : GetScalarType<T[P], OpexProfileGroupByOutputType[P]>
        }
      >
    >


  export type OpexProfileSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    usePenyusutan?: boolean
    penyusutan?: boolean
    isTotalVolumeLocked?: boolean
    totalVolume?: boolean
    menuVolumes?: boolean
    menuPrices?: boolean
    selectedMenuIds?: boolean
    assets?: boolean
    expenses?: boolean
    outletId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    outlet?: boolean | OpexProfile$outletArgs<ExtArgs>
  }, ExtArgs["result"]["opexProfile"]>



  export type OpexProfileSelectScalar = {
    id?: boolean
    name?: boolean
    usePenyusutan?: boolean
    penyusutan?: boolean
    isTotalVolumeLocked?: boolean
    totalVolume?: boolean
    menuVolumes?: boolean
    menuPrices?: boolean
    selectedMenuIds?: boolean
    assets?: boolean
    expenses?: boolean
    outletId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type OpexProfileOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "usePenyusutan" | "penyusutan" | "isTotalVolumeLocked" | "totalVolume" | "menuVolumes" | "menuPrices" | "selectedMenuIds" | "assets" | "expenses" | "outletId" | "createdAt" | "updatedAt", ExtArgs["result"]["opexProfile"]>
  export type OpexProfileInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    outlet?: boolean | OpexProfile$outletArgs<ExtArgs>
  }

  export type $OpexProfilePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OpexProfile"
    objects: {
      outlet: Prisma.$OutletPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      usePenyusutan: boolean
      penyusutan: number
      isTotalVolumeLocked: boolean
      totalVolume: number
      menuVolumes: Prisma.JsonValue
      menuPrices: Prisma.JsonValue
      selectedMenuIds: Prisma.JsonValue
      assets: Prisma.JsonValue
      expenses: Prisma.JsonValue
      outletId: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["opexProfile"]>
    composites: {}
  }

  type OpexProfileGetPayload<S extends boolean | null | undefined | OpexProfileDefaultArgs> = $Result.GetResult<Prisma.$OpexProfilePayload, S>

  type OpexProfileCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OpexProfileFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OpexProfileCountAggregateInputType | true
    }

  export interface OpexProfileDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OpexProfile'], meta: { name: 'OpexProfile' } }
    /**
     * Find zero or one OpexProfile that matches the filter.
     * @param {OpexProfileFindUniqueArgs} args - Arguments to find a OpexProfile
     * @example
     * // Get one OpexProfile
     * const opexProfile = await prisma.opexProfile.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OpexProfileFindUniqueArgs>(args: SelectSubset<T, OpexProfileFindUniqueArgs<ExtArgs>>): Prisma__OpexProfileClient<$Result.GetResult<Prisma.$OpexProfilePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one OpexProfile that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OpexProfileFindUniqueOrThrowArgs} args - Arguments to find a OpexProfile
     * @example
     * // Get one OpexProfile
     * const opexProfile = await prisma.opexProfile.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OpexProfileFindUniqueOrThrowArgs>(args: SelectSubset<T, OpexProfileFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OpexProfileClient<$Result.GetResult<Prisma.$OpexProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OpexProfile that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OpexProfileFindFirstArgs} args - Arguments to find a OpexProfile
     * @example
     * // Get one OpexProfile
     * const opexProfile = await prisma.opexProfile.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OpexProfileFindFirstArgs>(args?: SelectSubset<T, OpexProfileFindFirstArgs<ExtArgs>>): Prisma__OpexProfileClient<$Result.GetResult<Prisma.$OpexProfilePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OpexProfile that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OpexProfileFindFirstOrThrowArgs} args - Arguments to find a OpexProfile
     * @example
     * // Get one OpexProfile
     * const opexProfile = await prisma.opexProfile.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OpexProfileFindFirstOrThrowArgs>(args?: SelectSubset<T, OpexProfileFindFirstOrThrowArgs<ExtArgs>>): Prisma__OpexProfileClient<$Result.GetResult<Prisma.$OpexProfilePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more OpexProfiles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OpexProfileFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OpexProfiles
     * const opexProfiles = await prisma.opexProfile.findMany()
     * 
     * // Get first 10 OpexProfiles
     * const opexProfiles = await prisma.opexProfile.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const opexProfileWithIdOnly = await prisma.opexProfile.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OpexProfileFindManyArgs>(args?: SelectSubset<T, OpexProfileFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OpexProfilePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a OpexProfile.
     * @param {OpexProfileCreateArgs} args - Arguments to create a OpexProfile.
     * @example
     * // Create one OpexProfile
     * const OpexProfile = await prisma.opexProfile.create({
     *   data: {
     *     // ... data to create a OpexProfile
     *   }
     * })
     * 
     */
    create<T extends OpexProfileCreateArgs>(args: SelectSubset<T, OpexProfileCreateArgs<ExtArgs>>): Prisma__OpexProfileClient<$Result.GetResult<Prisma.$OpexProfilePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many OpexProfiles.
     * @param {OpexProfileCreateManyArgs} args - Arguments to create many OpexProfiles.
     * @example
     * // Create many OpexProfiles
     * const opexProfile = await prisma.opexProfile.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OpexProfileCreateManyArgs>(args?: SelectSubset<T, OpexProfileCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a OpexProfile.
     * @param {OpexProfileDeleteArgs} args - Arguments to delete one OpexProfile.
     * @example
     * // Delete one OpexProfile
     * const OpexProfile = await prisma.opexProfile.delete({
     *   where: {
     *     // ... filter to delete one OpexProfile
     *   }
     * })
     * 
     */
    delete<T extends OpexProfileDeleteArgs>(args: SelectSubset<T, OpexProfileDeleteArgs<ExtArgs>>): Prisma__OpexProfileClient<$Result.GetResult<Prisma.$OpexProfilePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one OpexProfile.
     * @param {OpexProfileUpdateArgs} args - Arguments to update one OpexProfile.
     * @example
     * // Update one OpexProfile
     * const opexProfile = await prisma.opexProfile.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OpexProfileUpdateArgs>(args: SelectSubset<T, OpexProfileUpdateArgs<ExtArgs>>): Prisma__OpexProfileClient<$Result.GetResult<Prisma.$OpexProfilePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more OpexProfiles.
     * @param {OpexProfileDeleteManyArgs} args - Arguments to filter OpexProfiles to delete.
     * @example
     * // Delete a few OpexProfiles
     * const { count } = await prisma.opexProfile.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OpexProfileDeleteManyArgs>(args?: SelectSubset<T, OpexProfileDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OpexProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OpexProfileUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OpexProfiles
     * const opexProfile = await prisma.opexProfile.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OpexProfileUpdateManyArgs>(args: SelectSubset<T, OpexProfileUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one OpexProfile.
     * @param {OpexProfileUpsertArgs} args - Arguments to update or create a OpexProfile.
     * @example
     * // Update or create a OpexProfile
     * const opexProfile = await prisma.opexProfile.upsert({
     *   create: {
     *     // ... data to create a OpexProfile
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OpexProfile we want to update
     *   }
     * })
     */
    upsert<T extends OpexProfileUpsertArgs>(args: SelectSubset<T, OpexProfileUpsertArgs<ExtArgs>>): Prisma__OpexProfileClient<$Result.GetResult<Prisma.$OpexProfilePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of OpexProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OpexProfileCountArgs} args - Arguments to filter OpexProfiles to count.
     * @example
     * // Count the number of OpexProfiles
     * const count = await prisma.opexProfile.count({
     *   where: {
     *     // ... the filter for the OpexProfiles we want to count
     *   }
     * })
    **/
    count<T extends OpexProfileCountArgs>(
      args?: Subset<T, OpexProfileCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OpexProfileCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OpexProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OpexProfileAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OpexProfileAggregateArgs>(args: Subset<T, OpexProfileAggregateArgs>): Prisma.PrismaPromise<GetOpexProfileAggregateType<T>>

    /**
     * Group by OpexProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OpexProfileGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OpexProfileGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OpexProfileGroupByArgs['orderBy'] }
        : { orderBy?: OpexProfileGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OpexProfileGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOpexProfileGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OpexProfile model
   */
  readonly fields: OpexProfileFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OpexProfile.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OpexProfileClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    outlet<T extends OpexProfile$outletArgs<ExtArgs> = {}>(args?: Subset<T, OpexProfile$outletArgs<ExtArgs>>): Prisma__OutletClient<$Result.GetResult<Prisma.$OutletPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the OpexProfile model
   */
  interface OpexProfileFieldRefs {
    readonly id: FieldRef<"OpexProfile", 'String'>
    readonly name: FieldRef<"OpexProfile", 'String'>
    readonly usePenyusutan: FieldRef<"OpexProfile", 'Boolean'>
    readonly penyusutan: FieldRef<"OpexProfile", 'Float'>
    readonly isTotalVolumeLocked: FieldRef<"OpexProfile", 'Boolean'>
    readonly totalVolume: FieldRef<"OpexProfile", 'Int'>
    readonly menuVolumes: FieldRef<"OpexProfile", 'Json'>
    readonly menuPrices: FieldRef<"OpexProfile", 'Json'>
    readonly selectedMenuIds: FieldRef<"OpexProfile", 'Json'>
    readonly assets: FieldRef<"OpexProfile", 'Json'>
    readonly expenses: FieldRef<"OpexProfile", 'Json'>
    readonly outletId: FieldRef<"OpexProfile", 'String'>
    readonly createdAt: FieldRef<"OpexProfile", 'DateTime'>
    readonly updatedAt: FieldRef<"OpexProfile", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * OpexProfile findUnique
   */
  export type OpexProfileFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OpexProfile
     */
    select?: OpexProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OpexProfile
     */
    omit?: OpexProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OpexProfileInclude<ExtArgs> | null
    /**
     * Filter, which OpexProfile to fetch.
     */
    where: OpexProfileWhereUniqueInput
  }

  /**
   * OpexProfile findUniqueOrThrow
   */
  export type OpexProfileFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OpexProfile
     */
    select?: OpexProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OpexProfile
     */
    omit?: OpexProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OpexProfileInclude<ExtArgs> | null
    /**
     * Filter, which OpexProfile to fetch.
     */
    where: OpexProfileWhereUniqueInput
  }

  /**
   * OpexProfile findFirst
   */
  export type OpexProfileFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OpexProfile
     */
    select?: OpexProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OpexProfile
     */
    omit?: OpexProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OpexProfileInclude<ExtArgs> | null
    /**
     * Filter, which OpexProfile to fetch.
     */
    where?: OpexProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OpexProfiles to fetch.
     */
    orderBy?: OpexProfileOrderByWithRelationInput | OpexProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OpexProfiles.
     */
    cursor?: OpexProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OpexProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OpexProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OpexProfiles.
     */
    distinct?: OpexProfileScalarFieldEnum | OpexProfileScalarFieldEnum[]
  }

  /**
   * OpexProfile findFirstOrThrow
   */
  export type OpexProfileFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OpexProfile
     */
    select?: OpexProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OpexProfile
     */
    omit?: OpexProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OpexProfileInclude<ExtArgs> | null
    /**
     * Filter, which OpexProfile to fetch.
     */
    where?: OpexProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OpexProfiles to fetch.
     */
    orderBy?: OpexProfileOrderByWithRelationInput | OpexProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OpexProfiles.
     */
    cursor?: OpexProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OpexProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OpexProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OpexProfiles.
     */
    distinct?: OpexProfileScalarFieldEnum | OpexProfileScalarFieldEnum[]
  }

  /**
   * OpexProfile findMany
   */
  export type OpexProfileFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OpexProfile
     */
    select?: OpexProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OpexProfile
     */
    omit?: OpexProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OpexProfileInclude<ExtArgs> | null
    /**
     * Filter, which OpexProfiles to fetch.
     */
    where?: OpexProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OpexProfiles to fetch.
     */
    orderBy?: OpexProfileOrderByWithRelationInput | OpexProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OpexProfiles.
     */
    cursor?: OpexProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OpexProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OpexProfiles.
     */
    skip?: number
    distinct?: OpexProfileScalarFieldEnum | OpexProfileScalarFieldEnum[]
  }

  /**
   * OpexProfile create
   */
  export type OpexProfileCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OpexProfile
     */
    select?: OpexProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OpexProfile
     */
    omit?: OpexProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OpexProfileInclude<ExtArgs> | null
    /**
     * The data needed to create a OpexProfile.
     */
    data: XOR<OpexProfileCreateInput, OpexProfileUncheckedCreateInput>
  }

  /**
   * OpexProfile createMany
   */
  export type OpexProfileCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OpexProfiles.
     */
    data: OpexProfileCreateManyInput | OpexProfileCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OpexProfile update
   */
  export type OpexProfileUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OpexProfile
     */
    select?: OpexProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OpexProfile
     */
    omit?: OpexProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OpexProfileInclude<ExtArgs> | null
    /**
     * The data needed to update a OpexProfile.
     */
    data: XOR<OpexProfileUpdateInput, OpexProfileUncheckedUpdateInput>
    /**
     * Choose, which OpexProfile to update.
     */
    where: OpexProfileWhereUniqueInput
  }

  /**
   * OpexProfile updateMany
   */
  export type OpexProfileUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OpexProfiles.
     */
    data: XOR<OpexProfileUpdateManyMutationInput, OpexProfileUncheckedUpdateManyInput>
    /**
     * Filter which OpexProfiles to update
     */
    where?: OpexProfileWhereInput
    /**
     * Limit how many OpexProfiles to update.
     */
    limit?: number
  }

  /**
   * OpexProfile upsert
   */
  export type OpexProfileUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OpexProfile
     */
    select?: OpexProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OpexProfile
     */
    omit?: OpexProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OpexProfileInclude<ExtArgs> | null
    /**
     * The filter to search for the OpexProfile to update in case it exists.
     */
    where: OpexProfileWhereUniqueInput
    /**
     * In case the OpexProfile found by the `where` argument doesn't exist, create a new OpexProfile with this data.
     */
    create: XOR<OpexProfileCreateInput, OpexProfileUncheckedCreateInput>
    /**
     * In case the OpexProfile was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OpexProfileUpdateInput, OpexProfileUncheckedUpdateInput>
  }

  /**
   * OpexProfile delete
   */
  export type OpexProfileDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OpexProfile
     */
    select?: OpexProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OpexProfile
     */
    omit?: OpexProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OpexProfileInclude<ExtArgs> | null
    /**
     * Filter which OpexProfile to delete.
     */
    where: OpexProfileWhereUniqueInput
  }

  /**
   * OpexProfile deleteMany
   */
  export type OpexProfileDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OpexProfiles to delete
     */
    where?: OpexProfileWhereInput
    /**
     * Limit how many OpexProfiles to delete.
     */
    limit?: number
  }

  /**
   * OpexProfile.outlet
   */
  export type OpexProfile$outletArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outlet
     */
    select?: OutletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outlet
     */
    omit?: OutletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutletInclude<ExtArgs> | null
    where?: OutletWhereInput
  }

  /**
   * OpexProfile without action
   */
  export type OpexProfileDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OpexProfile
     */
    select?: OpexProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OpexProfile
     */
    omit?: OpexProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OpexProfileInclude<ExtArgs> | null
  }


  /**
   * Model BepSettings
   */

  export type AggregateBepSettings = {
    _count: BepSettingsCountAggregateOutputType | null
    _avg: BepSettingsAvgAggregateOutputType | null
    _sum: BepSettingsSumAggregateOutputType | null
    _min: BepSettingsMinAggregateOutputType | null
    _max: BepSettingsMaxAggregateOutputType | null
  }

  export type BepSettingsAvgAggregateOutputType = {
    operationalDays: number | null
    manualOpex: number | null
    manualMargin: number | null
    manualPrice: number | null
    actualVolume: number | null
    manualInvestment: number | null
    targetPaybackMonths: number | null
  }

  export type BepSettingsSumAggregateOutputType = {
    operationalDays: number | null
    manualOpex: number | null
    manualMargin: number | null
    manualPrice: number | null
    actualVolume: number | null
    manualInvestment: number | null
    targetPaybackMonths: number | null
  }

  export type BepSettingsMinAggregateOutputType = {
    id: string | null
    outletId: string | null
    operationalDays: number | null
    manualOpex: number | null
    manualMargin: number | null
    manualPrice: number | null
    actualVolume: number | null
    manualInvestment: number | null
    targetPaybackMonths: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BepSettingsMaxAggregateOutputType = {
    id: string | null
    outletId: string | null
    operationalDays: number | null
    manualOpex: number | null
    manualMargin: number | null
    manualPrice: number | null
    actualVolume: number | null
    manualInvestment: number | null
    targetPaybackMonths: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BepSettingsCountAggregateOutputType = {
    id: number
    outletId: number
    operationalDays: number
    manualOpex: number
    manualMargin: number
    manualPrice: number
    actualVolume: number
    manualInvestment: number
    targetPaybackMonths: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type BepSettingsAvgAggregateInputType = {
    operationalDays?: true
    manualOpex?: true
    manualMargin?: true
    manualPrice?: true
    actualVolume?: true
    manualInvestment?: true
    targetPaybackMonths?: true
  }

  export type BepSettingsSumAggregateInputType = {
    operationalDays?: true
    manualOpex?: true
    manualMargin?: true
    manualPrice?: true
    actualVolume?: true
    manualInvestment?: true
    targetPaybackMonths?: true
  }

  export type BepSettingsMinAggregateInputType = {
    id?: true
    outletId?: true
    operationalDays?: true
    manualOpex?: true
    manualMargin?: true
    manualPrice?: true
    actualVolume?: true
    manualInvestment?: true
    targetPaybackMonths?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BepSettingsMaxAggregateInputType = {
    id?: true
    outletId?: true
    operationalDays?: true
    manualOpex?: true
    manualMargin?: true
    manualPrice?: true
    actualVolume?: true
    manualInvestment?: true
    targetPaybackMonths?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BepSettingsCountAggregateInputType = {
    id?: true
    outletId?: true
    operationalDays?: true
    manualOpex?: true
    manualMargin?: true
    manualPrice?: true
    actualVolume?: true
    manualInvestment?: true
    targetPaybackMonths?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type BepSettingsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BepSettings to aggregate.
     */
    where?: BepSettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BepSettings to fetch.
     */
    orderBy?: BepSettingsOrderByWithRelationInput | BepSettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BepSettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BepSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BepSettings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned BepSettings
    **/
    _count?: true | BepSettingsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BepSettingsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BepSettingsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BepSettingsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BepSettingsMaxAggregateInputType
  }

  export type GetBepSettingsAggregateType<T extends BepSettingsAggregateArgs> = {
        [P in keyof T & keyof AggregateBepSettings]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBepSettings[P]>
      : GetScalarType<T[P], AggregateBepSettings[P]>
  }




  export type BepSettingsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BepSettingsWhereInput
    orderBy?: BepSettingsOrderByWithAggregationInput | BepSettingsOrderByWithAggregationInput[]
    by: BepSettingsScalarFieldEnum[] | BepSettingsScalarFieldEnum
    having?: BepSettingsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BepSettingsCountAggregateInputType | true
    _avg?: BepSettingsAvgAggregateInputType
    _sum?: BepSettingsSumAggregateInputType
    _min?: BepSettingsMinAggregateInputType
    _max?: BepSettingsMaxAggregateInputType
  }

  export type BepSettingsGroupByOutputType = {
    id: string
    outletId: string
    operationalDays: number
    manualOpex: number | null
    manualMargin: number | null
    manualPrice: number | null
    actualVolume: number | null
    manualInvestment: number | null
    targetPaybackMonths: number
    createdAt: Date
    updatedAt: Date
    _count: BepSettingsCountAggregateOutputType | null
    _avg: BepSettingsAvgAggregateOutputType | null
    _sum: BepSettingsSumAggregateOutputType | null
    _min: BepSettingsMinAggregateOutputType | null
    _max: BepSettingsMaxAggregateOutputType | null
  }

  type GetBepSettingsGroupByPayload<T extends BepSettingsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BepSettingsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BepSettingsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BepSettingsGroupByOutputType[P]>
            : GetScalarType<T[P], BepSettingsGroupByOutputType[P]>
        }
      >
    >


  export type BepSettingsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    outletId?: boolean
    operationalDays?: boolean
    manualOpex?: boolean
    manualMargin?: boolean
    manualPrice?: boolean
    actualVolume?: boolean
    manualInvestment?: boolean
    targetPaybackMonths?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    outlet?: boolean | OutletDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["bepSettings"]>



  export type BepSettingsSelectScalar = {
    id?: boolean
    outletId?: boolean
    operationalDays?: boolean
    manualOpex?: boolean
    manualMargin?: boolean
    manualPrice?: boolean
    actualVolume?: boolean
    manualInvestment?: boolean
    targetPaybackMonths?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type BepSettingsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "outletId" | "operationalDays" | "manualOpex" | "manualMargin" | "manualPrice" | "actualVolume" | "manualInvestment" | "targetPaybackMonths" | "createdAt" | "updatedAt", ExtArgs["result"]["bepSettings"]>
  export type BepSettingsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    outlet?: boolean | OutletDefaultArgs<ExtArgs>
  }

  export type $BepSettingsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "BepSettings"
    objects: {
      outlet: Prisma.$OutletPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      outletId: string
      operationalDays: number
      manualOpex: number | null
      manualMargin: number | null
      manualPrice: number | null
      actualVolume: number | null
      manualInvestment: number | null
      targetPaybackMonths: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["bepSettings"]>
    composites: {}
  }

  type BepSettingsGetPayload<S extends boolean | null | undefined | BepSettingsDefaultArgs> = $Result.GetResult<Prisma.$BepSettingsPayload, S>

  type BepSettingsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BepSettingsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BepSettingsCountAggregateInputType | true
    }

  export interface BepSettingsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['BepSettings'], meta: { name: 'BepSettings' } }
    /**
     * Find zero or one BepSettings that matches the filter.
     * @param {BepSettingsFindUniqueArgs} args - Arguments to find a BepSettings
     * @example
     * // Get one BepSettings
     * const bepSettings = await prisma.bepSettings.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BepSettingsFindUniqueArgs>(args: SelectSubset<T, BepSettingsFindUniqueArgs<ExtArgs>>): Prisma__BepSettingsClient<$Result.GetResult<Prisma.$BepSettingsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one BepSettings that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BepSettingsFindUniqueOrThrowArgs} args - Arguments to find a BepSettings
     * @example
     * // Get one BepSettings
     * const bepSettings = await prisma.bepSettings.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BepSettingsFindUniqueOrThrowArgs>(args: SelectSubset<T, BepSettingsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BepSettingsClient<$Result.GetResult<Prisma.$BepSettingsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BepSettings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BepSettingsFindFirstArgs} args - Arguments to find a BepSettings
     * @example
     * // Get one BepSettings
     * const bepSettings = await prisma.bepSettings.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BepSettingsFindFirstArgs>(args?: SelectSubset<T, BepSettingsFindFirstArgs<ExtArgs>>): Prisma__BepSettingsClient<$Result.GetResult<Prisma.$BepSettingsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BepSettings that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BepSettingsFindFirstOrThrowArgs} args - Arguments to find a BepSettings
     * @example
     * // Get one BepSettings
     * const bepSettings = await prisma.bepSettings.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BepSettingsFindFirstOrThrowArgs>(args?: SelectSubset<T, BepSettingsFindFirstOrThrowArgs<ExtArgs>>): Prisma__BepSettingsClient<$Result.GetResult<Prisma.$BepSettingsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more BepSettings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BepSettingsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all BepSettings
     * const bepSettings = await prisma.bepSettings.findMany()
     * 
     * // Get first 10 BepSettings
     * const bepSettings = await prisma.bepSettings.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const bepSettingsWithIdOnly = await prisma.bepSettings.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BepSettingsFindManyArgs>(args?: SelectSubset<T, BepSettingsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BepSettingsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a BepSettings.
     * @param {BepSettingsCreateArgs} args - Arguments to create a BepSettings.
     * @example
     * // Create one BepSettings
     * const BepSettings = await prisma.bepSettings.create({
     *   data: {
     *     // ... data to create a BepSettings
     *   }
     * })
     * 
     */
    create<T extends BepSettingsCreateArgs>(args: SelectSubset<T, BepSettingsCreateArgs<ExtArgs>>): Prisma__BepSettingsClient<$Result.GetResult<Prisma.$BepSettingsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many BepSettings.
     * @param {BepSettingsCreateManyArgs} args - Arguments to create many BepSettings.
     * @example
     * // Create many BepSettings
     * const bepSettings = await prisma.bepSettings.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BepSettingsCreateManyArgs>(args?: SelectSubset<T, BepSettingsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a BepSettings.
     * @param {BepSettingsDeleteArgs} args - Arguments to delete one BepSettings.
     * @example
     * // Delete one BepSettings
     * const BepSettings = await prisma.bepSettings.delete({
     *   where: {
     *     // ... filter to delete one BepSettings
     *   }
     * })
     * 
     */
    delete<T extends BepSettingsDeleteArgs>(args: SelectSubset<T, BepSettingsDeleteArgs<ExtArgs>>): Prisma__BepSettingsClient<$Result.GetResult<Prisma.$BepSettingsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one BepSettings.
     * @param {BepSettingsUpdateArgs} args - Arguments to update one BepSettings.
     * @example
     * // Update one BepSettings
     * const bepSettings = await prisma.bepSettings.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BepSettingsUpdateArgs>(args: SelectSubset<T, BepSettingsUpdateArgs<ExtArgs>>): Prisma__BepSettingsClient<$Result.GetResult<Prisma.$BepSettingsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more BepSettings.
     * @param {BepSettingsDeleteManyArgs} args - Arguments to filter BepSettings to delete.
     * @example
     * // Delete a few BepSettings
     * const { count } = await prisma.bepSettings.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BepSettingsDeleteManyArgs>(args?: SelectSubset<T, BepSettingsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BepSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BepSettingsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many BepSettings
     * const bepSettings = await prisma.bepSettings.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BepSettingsUpdateManyArgs>(args: SelectSubset<T, BepSettingsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one BepSettings.
     * @param {BepSettingsUpsertArgs} args - Arguments to update or create a BepSettings.
     * @example
     * // Update or create a BepSettings
     * const bepSettings = await prisma.bepSettings.upsert({
     *   create: {
     *     // ... data to create a BepSettings
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the BepSettings we want to update
     *   }
     * })
     */
    upsert<T extends BepSettingsUpsertArgs>(args: SelectSubset<T, BepSettingsUpsertArgs<ExtArgs>>): Prisma__BepSettingsClient<$Result.GetResult<Prisma.$BepSettingsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of BepSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BepSettingsCountArgs} args - Arguments to filter BepSettings to count.
     * @example
     * // Count the number of BepSettings
     * const count = await prisma.bepSettings.count({
     *   where: {
     *     // ... the filter for the BepSettings we want to count
     *   }
     * })
    **/
    count<T extends BepSettingsCountArgs>(
      args?: Subset<T, BepSettingsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BepSettingsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a BepSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BepSettingsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BepSettingsAggregateArgs>(args: Subset<T, BepSettingsAggregateArgs>): Prisma.PrismaPromise<GetBepSettingsAggregateType<T>>

    /**
     * Group by BepSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BepSettingsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BepSettingsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BepSettingsGroupByArgs['orderBy'] }
        : { orderBy?: BepSettingsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BepSettingsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBepSettingsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the BepSettings model
   */
  readonly fields: BepSettingsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for BepSettings.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BepSettingsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    outlet<T extends OutletDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OutletDefaultArgs<ExtArgs>>): Prisma__OutletClient<$Result.GetResult<Prisma.$OutletPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the BepSettings model
   */
  interface BepSettingsFieldRefs {
    readonly id: FieldRef<"BepSettings", 'String'>
    readonly outletId: FieldRef<"BepSettings", 'String'>
    readonly operationalDays: FieldRef<"BepSettings", 'Int'>
    readonly manualOpex: FieldRef<"BepSettings", 'Float'>
    readonly manualMargin: FieldRef<"BepSettings", 'Float'>
    readonly manualPrice: FieldRef<"BepSettings", 'Float'>
    readonly actualVolume: FieldRef<"BepSettings", 'Int'>
    readonly manualInvestment: FieldRef<"BepSettings", 'Float'>
    readonly targetPaybackMonths: FieldRef<"BepSettings", 'Int'>
    readonly createdAt: FieldRef<"BepSettings", 'DateTime'>
    readonly updatedAt: FieldRef<"BepSettings", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * BepSettings findUnique
   */
  export type BepSettingsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BepSettings
     */
    select?: BepSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BepSettings
     */
    omit?: BepSettingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BepSettingsInclude<ExtArgs> | null
    /**
     * Filter, which BepSettings to fetch.
     */
    where: BepSettingsWhereUniqueInput
  }

  /**
   * BepSettings findUniqueOrThrow
   */
  export type BepSettingsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BepSettings
     */
    select?: BepSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BepSettings
     */
    omit?: BepSettingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BepSettingsInclude<ExtArgs> | null
    /**
     * Filter, which BepSettings to fetch.
     */
    where: BepSettingsWhereUniqueInput
  }

  /**
   * BepSettings findFirst
   */
  export type BepSettingsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BepSettings
     */
    select?: BepSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BepSettings
     */
    omit?: BepSettingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BepSettingsInclude<ExtArgs> | null
    /**
     * Filter, which BepSettings to fetch.
     */
    where?: BepSettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BepSettings to fetch.
     */
    orderBy?: BepSettingsOrderByWithRelationInput | BepSettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BepSettings.
     */
    cursor?: BepSettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BepSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BepSettings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BepSettings.
     */
    distinct?: BepSettingsScalarFieldEnum | BepSettingsScalarFieldEnum[]
  }

  /**
   * BepSettings findFirstOrThrow
   */
  export type BepSettingsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BepSettings
     */
    select?: BepSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BepSettings
     */
    omit?: BepSettingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BepSettingsInclude<ExtArgs> | null
    /**
     * Filter, which BepSettings to fetch.
     */
    where?: BepSettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BepSettings to fetch.
     */
    orderBy?: BepSettingsOrderByWithRelationInput | BepSettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BepSettings.
     */
    cursor?: BepSettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BepSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BepSettings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BepSettings.
     */
    distinct?: BepSettingsScalarFieldEnum | BepSettingsScalarFieldEnum[]
  }

  /**
   * BepSettings findMany
   */
  export type BepSettingsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BepSettings
     */
    select?: BepSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BepSettings
     */
    omit?: BepSettingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BepSettingsInclude<ExtArgs> | null
    /**
     * Filter, which BepSettings to fetch.
     */
    where?: BepSettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BepSettings to fetch.
     */
    orderBy?: BepSettingsOrderByWithRelationInput | BepSettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing BepSettings.
     */
    cursor?: BepSettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BepSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BepSettings.
     */
    skip?: number
    distinct?: BepSettingsScalarFieldEnum | BepSettingsScalarFieldEnum[]
  }

  /**
   * BepSettings create
   */
  export type BepSettingsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BepSettings
     */
    select?: BepSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BepSettings
     */
    omit?: BepSettingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BepSettingsInclude<ExtArgs> | null
    /**
     * The data needed to create a BepSettings.
     */
    data: XOR<BepSettingsCreateInput, BepSettingsUncheckedCreateInput>
  }

  /**
   * BepSettings createMany
   */
  export type BepSettingsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many BepSettings.
     */
    data: BepSettingsCreateManyInput | BepSettingsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * BepSettings update
   */
  export type BepSettingsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BepSettings
     */
    select?: BepSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BepSettings
     */
    omit?: BepSettingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BepSettingsInclude<ExtArgs> | null
    /**
     * The data needed to update a BepSettings.
     */
    data: XOR<BepSettingsUpdateInput, BepSettingsUncheckedUpdateInput>
    /**
     * Choose, which BepSettings to update.
     */
    where: BepSettingsWhereUniqueInput
  }

  /**
   * BepSettings updateMany
   */
  export type BepSettingsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update BepSettings.
     */
    data: XOR<BepSettingsUpdateManyMutationInput, BepSettingsUncheckedUpdateManyInput>
    /**
     * Filter which BepSettings to update
     */
    where?: BepSettingsWhereInput
    /**
     * Limit how many BepSettings to update.
     */
    limit?: number
  }

  /**
   * BepSettings upsert
   */
  export type BepSettingsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BepSettings
     */
    select?: BepSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BepSettings
     */
    omit?: BepSettingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BepSettingsInclude<ExtArgs> | null
    /**
     * The filter to search for the BepSettings to update in case it exists.
     */
    where: BepSettingsWhereUniqueInput
    /**
     * In case the BepSettings found by the `where` argument doesn't exist, create a new BepSettings with this data.
     */
    create: XOR<BepSettingsCreateInput, BepSettingsUncheckedCreateInput>
    /**
     * In case the BepSettings was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BepSettingsUpdateInput, BepSettingsUncheckedUpdateInput>
  }

  /**
   * BepSettings delete
   */
  export type BepSettingsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BepSettings
     */
    select?: BepSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BepSettings
     */
    omit?: BepSettingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BepSettingsInclude<ExtArgs> | null
    /**
     * Filter which BepSettings to delete.
     */
    where: BepSettingsWhereUniqueInput
  }

  /**
   * BepSettings deleteMany
   */
  export type BepSettingsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BepSettings to delete
     */
    where?: BepSettingsWhereInput
    /**
     * Limit how many BepSettings to delete.
     */
    limit?: number
  }

  /**
   * BepSettings without action
   */
  export type BepSettingsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BepSettings
     */
    select?: BepSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BepSettings
     */
    omit?: BepSettingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BepSettingsInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const OutletScalarFieldEnum: {
    id: 'id',
    name: 'name',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type OutletScalarFieldEnum = (typeof OutletScalarFieldEnum)[keyof typeof OutletScalarFieldEnum]


  export const MenuScalarFieldEnum: {
    id: 'id',
    name: 'name',
    emoji: 'emoji',
    category: 'category',
    margin: 'margin',
    ingredients: 'ingredients',
    packaging: 'packaging',
    ops: 'ops',
    outletId: 'outletId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type MenuScalarFieldEnum = (typeof MenuScalarFieldEnum)[keyof typeof MenuScalarFieldEnum]


  export const OpexProfileScalarFieldEnum: {
    id: 'id',
    name: 'name',
    usePenyusutan: 'usePenyusutan',
    penyusutan: 'penyusutan',
    isTotalVolumeLocked: 'isTotalVolumeLocked',
    totalVolume: 'totalVolume',
    menuVolumes: 'menuVolumes',
    menuPrices: 'menuPrices',
    selectedMenuIds: 'selectedMenuIds',
    assets: 'assets',
    expenses: 'expenses',
    outletId: 'outletId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type OpexProfileScalarFieldEnum = (typeof OpexProfileScalarFieldEnum)[keyof typeof OpexProfileScalarFieldEnum]


  export const BepSettingsScalarFieldEnum: {
    id: 'id',
    outletId: 'outletId',
    operationalDays: 'operationalDays',
    manualOpex: 'manualOpex',
    manualMargin: 'manualMargin',
    manualPrice: 'manualPrice',
    actualVolume: 'actualVolume',
    manualInvestment: 'manualInvestment',
    targetPaybackMonths: 'targetPaybackMonths',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type BepSettingsScalarFieldEnum = (typeof BepSettingsScalarFieldEnum)[keyof typeof BepSettingsScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const OutletOrderByRelevanceFieldEnum: {
    id: 'id',
    name: 'name'
  };

  export type OutletOrderByRelevanceFieldEnum = (typeof OutletOrderByRelevanceFieldEnum)[keyof typeof OutletOrderByRelevanceFieldEnum]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const MenuOrderByRelevanceFieldEnum: {
    id: 'id',
    name: 'name',
    emoji: 'emoji',
    category: 'category',
    outletId: 'outletId'
  };

  export type MenuOrderByRelevanceFieldEnum = (typeof MenuOrderByRelevanceFieldEnum)[keyof typeof MenuOrderByRelevanceFieldEnum]


  export const OpexProfileOrderByRelevanceFieldEnum: {
    id: 'id',
    name: 'name',
    outletId: 'outletId'
  };

  export type OpexProfileOrderByRelevanceFieldEnum = (typeof OpexProfileOrderByRelevanceFieldEnum)[keyof typeof OpexProfileOrderByRelevanceFieldEnum]


  export const BepSettingsOrderByRelevanceFieldEnum: {
    id: 'id',
    outletId: 'outletId'
  };

  export type BepSettingsOrderByRelevanceFieldEnum = (typeof BepSettingsOrderByRelevanceFieldEnum)[keyof typeof BepSettingsOrderByRelevanceFieldEnum]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    
  /**
   * Deep Input Types
   */


  export type OutletWhereInput = {
    AND?: OutletWhereInput | OutletWhereInput[]
    OR?: OutletWhereInput[]
    NOT?: OutletWhereInput | OutletWhereInput[]
    id?: StringFilter<"Outlet"> | string
    name?: StringFilter<"Outlet"> | string
    createdAt?: DateTimeFilter<"Outlet"> | Date | string
    updatedAt?: DateTimeFilter<"Outlet"> | Date | string
    menus?: MenuListRelationFilter
    opexProfiles?: OpexProfileListRelationFilter
    bepSettings?: XOR<BepSettingsNullableScalarRelationFilter, BepSettingsWhereInput> | null
  }

  export type OutletOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    menus?: MenuOrderByRelationAggregateInput
    opexProfiles?: OpexProfileOrderByRelationAggregateInput
    bepSettings?: BepSettingsOrderByWithRelationInput
    _relevance?: OutletOrderByRelevanceInput
  }

  export type OutletWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: OutletWhereInput | OutletWhereInput[]
    OR?: OutletWhereInput[]
    NOT?: OutletWhereInput | OutletWhereInput[]
    name?: StringFilter<"Outlet"> | string
    createdAt?: DateTimeFilter<"Outlet"> | Date | string
    updatedAt?: DateTimeFilter<"Outlet"> | Date | string
    menus?: MenuListRelationFilter
    opexProfiles?: OpexProfileListRelationFilter
    bepSettings?: XOR<BepSettingsNullableScalarRelationFilter, BepSettingsWhereInput> | null
  }, "id">

  export type OutletOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: OutletCountOrderByAggregateInput
    _max?: OutletMaxOrderByAggregateInput
    _min?: OutletMinOrderByAggregateInput
  }

  export type OutletScalarWhereWithAggregatesInput = {
    AND?: OutletScalarWhereWithAggregatesInput | OutletScalarWhereWithAggregatesInput[]
    OR?: OutletScalarWhereWithAggregatesInput[]
    NOT?: OutletScalarWhereWithAggregatesInput | OutletScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Outlet"> | string
    name?: StringWithAggregatesFilter<"Outlet"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Outlet"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Outlet"> | Date | string
  }

  export type MenuWhereInput = {
    AND?: MenuWhereInput | MenuWhereInput[]
    OR?: MenuWhereInput[]
    NOT?: MenuWhereInput | MenuWhereInput[]
    id?: StringFilter<"Menu"> | string
    name?: StringFilter<"Menu"> | string
    emoji?: StringFilter<"Menu"> | string
    category?: StringFilter<"Menu"> | string
    margin?: FloatFilter<"Menu"> | number
    ingredients?: JsonFilter<"Menu">
    packaging?: JsonFilter<"Menu">
    ops?: JsonNullableFilter<"Menu">
    outletId?: StringNullableFilter<"Menu"> | string | null
    createdAt?: DateTimeFilter<"Menu"> | Date | string
    updatedAt?: DateTimeFilter<"Menu"> | Date | string
    outlet?: XOR<OutletNullableScalarRelationFilter, OutletWhereInput> | null
  }

  export type MenuOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    emoji?: SortOrder
    category?: SortOrder
    margin?: SortOrder
    ingredients?: SortOrder
    packaging?: SortOrder
    ops?: SortOrderInput | SortOrder
    outletId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    outlet?: OutletOrderByWithRelationInput
    _relevance?: MenuOrderByRelevanceInput
  }

  export type MenuWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MenuWhereInput | MenuWhereInput[]
    OR?: MenuWhereInput[]
    NOT?: MenuWhereInput | MenuWhereInput[]
    name?: StringFilter<"Menu"> | string
    emoji?: StringFilter<"Menu"> | string
    category?: StringFilter<"Menu"> | string
    margin?: FloatFilter<"Menu"> | number
    ingredients?: JsonFilter<"Menu">
    packaging?: JsonFilter<"Menu">
    ops?: JsonNullableFilter<"Menu">
    outletId?: StringNullableFilter<"Menu"> | string | null
    createdAt?: DateTimeFilter<"Menu"> | Date | string
    updatedAt?: DateTimeFilter<"Menu"> | Date | string
    outlet?: XOR<OutletNullableScalarRelationFilter, OutletWhereInput> | null
  }, "id">

  export type MenuOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    emoji?: SortOrder
    category?: SortOrder
    margin?: SortOrder
    ingredients?: SortOrder
    packaging?: SortOrder
    ops?: SortOrderInput | SortOrder
    outletId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: MenuCountOrderByAggregateInput
    _avg?: MenuAvgOrderByAggregateInput
    _max?: MenuMaxOrderByAggregateInput
    _min?: MenuMinOrderByAggregateInput
    _sum?: MenuSumOrderByAggregateInput
  }

  export type MenuScalarWhereWithAggregatesInput = {
    AND?: MenuScalarWhereWithAggregatesInput | MenuScalarWhereWithAggregatesInput[]
    OR?: MenuScalarWhereWithAggregatesInput[]
    NOT?: MenuScalarWhereWithAggregatesInput | MenuScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Menu"> | string
    name?: StringWithAggregatesFilter<"Menu"> | string
    emoji?: StringWithAggregatesFilter<"Menu"> | string
    category?: StringWithAggregatesFilter<"Menu"> | string
    margin?: FloatWithAggregatesFilter<"Menu"> | number
    ingredients?: JsonWithAggregatesFilter<"Menu">
    packaging?: JsonWithAggregatesFilter<"Menu">
    ops?: JsonNullableWithAggregatesFilter<"Menu">
    outletId?: StringNullableWithAggregatesFilter<"Menu"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Menu"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Menu"> | Date | string
  }

  export type OpexProfileWhereInput = {
    AND?: OpexProfileWhereInput | OpexProfileWhereInput[]
    OR?: OpexProfileWhereInput[]
    NOT?: OpexProfileWhereInput | OpexProfileWhereInput[]
    id?: StringFilter<"OpexProfile"> | string
    name?: StringFilter<"OpexProfile"> | string
    usePenyusutan?: BoolFilter<"OpexProfile"> | boolean
    penyusutan?: FloatFilter<"OpexProfile"> | number
    isTotalVolumeLocked?: BoolFilter<"OpexProfile"> | boolean
    totalVolume?: IntFilter<"OpexProfile"> | number
    menuVolumes?: JsonFilter<"OpexProfile">
    menuPrices?: JsonFilter<"OpexProfile">
    selectedMenuIds?: JsonFilter<"OpexProfile">
    assets?: JsonFilter<"OpexProfile">
    expenses?: JsonFilter<"OpexProfile">
    outletId?: StringNullableFilter<"OpexProfile"> | string | null
    createdAt?: DateTimeFilter<"OpexProfile"> | Date | string
    updatedAt?: DateTimeFilter<"OpexProfile"> | Date | string
    outlet?: XOR<OutletNullableScalarRelationFilter, OutletWhereInput> | null
  }

  export type OpexProfileOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    usePenyusutan?: SortOrder
    penyusutan?: SortOrder
    isTotalVolumeLocked?: SortOrder
    totalVolume?: SortOrder
    menuVolumes?: SortOrder
    menuPrices?: SortOrder
    selectedMenuIds?: SortOrder
    assets?: SortOrder
    expenses?: SortOrder
    outletId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    outlet?: OutletOrderByWithRelationInput
    _relevance?: OpexProfileOrderByRelevanceInput
  }

  export type OpexProfileWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: OpexProfileWhereInput | OpexProfileWhereInput[]
    OR?: OpexProfileWhereInput[]
    NOT?: OpexProfileWhereInput | OpexProfileWhereInput[]
    name?: StringFilter<"OpexProfile"> | string
    usePenyusutan?: BoolFilter<"OpexProfile"> | boolean
    penyusutan?: FloatFilter<"OpexProfile"> | number
    isTotalVolumeLocked?: BoolFilter<"OpexProfile"> | boolean
    totalVolume?: IntFilter<"OpexProfile"> | number
    menuVolumes?: JsonFilter<"OpexProfile">
    menuPrices?: JsonFilter<"OpexProfile">
    selectedMenuIds?: JsonFilter<"OpexProfile">
    assets?: JsonFilter<"OpexProfile">
    expenses?: JsonFilter<"OpexProfile">
    outletId?: StringNullableFilter<"OpexProfile"> | string | null
    createdAt?: DateTimeFilter<"OpexProfile"> | Date | string
    updatedAt?: DateTimeFilter<"OpexProfile"> | Date | string
    outlet?: XOR<OutletNullableScalarRelationFilter, OutletWhereInput> | null
  }, "id">

  export type OpexProfileOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    usePenyusutan?: SortOrder
    penyusutan?: SortOrder
    isTotalVolumeLocked?: SortOrder
    totalVolume?: SortOrder
    menuVolumes?: SortOrder
    menuPrices?: SortOrder
    selectedMenuIds?: SortOrder
    assets?: SortOrder
    expenses?: SortOrder
    outletId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: OpexProfileCountOrderByAggregateInput
    _avg?: OpexProfileAvgOrderByAggregateInput
    _max?: OpexProfileMaxOrderByAggregateInput
    _min?: OpexProfileMinOrderByAggregateInput
    _sum?: OpexProfileSumOrderByAggregateInput
  }

  export type OpexProfileScalarWhereWithAggregatesInput = {
    AND?: OpexProfileScalarWhereWithAggregatesInput | OpexProfileScalarWhereWithAggregatesInput[]
    OR?: OpexProfileScalarWhereWithAggregatesInput[]
    NOT?: OpexProfileScalarWhereWithAggregatesInput | OpexProfileScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"OpexProfile"> | string
    name?: StringWithAggregatesFilter<"OpexProfile"> | string
    usePenyusutan?: BoolWithAggregatesFilter<"OpexProfile"> | boolean
    penyusutan?: FloatWithAggregatesFilter<"OpexProfile"> | number
    isTotalVolumeLocked?: BoolWithAggregatesFilter<"OpexProfile"> | boolean
    totalVolume?: IntWithAggregatesFilter<"OpexProfile"> | number
    menuVolumes?: JsonWithAggregatesFilter<"OpexProfile">
    menuPrices?: JsonWithAggregatesFilter<"OpexProfile">
    selectedMenuIds?: JsonWithAggregatesFilter<"OpexProfile">
    assets?: JsonWithAggregatesFilter<"OpexProfile">
    expenses?: JsonWithAggregatesFilter<"OpexProfile">
    outletId?: StringNullableWithAggregatesFilter<"OpexProfile"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"OpexProfile"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"OpexProfile"> | Date | string
  }

  export type BepSettingsWhereInput = {
    AND?: BepSettingsWhereInput | BepSettingsWhereInput[]
    OR?: BepSettingsWhereInput[]
    NOT?: BepSettingsWhereInput | BepSettingsWhereInput[]
    id?: StringFilter<"BepSettings"> | string
    outletId?: StringFilter<"BepSettings"> | string
    operationalDays?: IntFilter<"BepSettings"> | number
    manualOpex?: FloatNullableFilter<"BepSettings"> | number | null
    manualMargin?: FloatNullableFilter<"BepSettings"> | number | null
    manualPrice?: FloatNullableFilter<"BepSettings"> | number | null
    actualVolume?: IntNullableFilter<"BepSettings"> | number | null
    manualInvestment?: FloatNullableFilter<"BepSettings"> | number | null
    targetPaybackMonths?: IntFilter<"BepSettings"> | number
    createdAt?: DateTimeFilter<"BepSettings"> | Date | string
    updatedAt?: DateTimeFilter<"BepSettings"> | Date | string
    outlet?: XOR<OutletScalarRelationFilter, OutletWhereInput>
  }

  export type BepSettingsOrderByWithRelationInput = {
    id?: SortOrder
    outletId?: SortOrder
    operationalDays?: SortOrder
    manualOpex?: SortOrderInput | SortOrder
    manualMargin?: SortOrderInput | SortOrder
    manualPrice?: SortOrderInput | SortOrder
    actualVolume?: SortOrderInput | SortOrder
    manualInvestment?: SortOrderInput | SortOrder
    targetPaybackMonths?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    outlet?: OutletOrderByWithRelationInput
    _relevance?: BepSettingsOrderByRelevanceInput
  }

  export type BepSettingsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    outletId?: string
    AND?: BepSettingsWhereInput | BepSettingsWhereInput[]
    OR?: BepSettingsWhereInput[]
    NOT?: BepSettingsWhereInput | BepSettingsWhereInput[]
    operationalDays?: IntFilter<"BepSettings"> | number
    manualOpex?: FloatNullableFilter<"BepSettings"> | number | null
    manualMargin?: FloatNullableFilter<"BepSettings"> | number | null
    manualPrice?: FloatNullableFilter<"BepSettings"> | number | null
    actualVolume?: IntNullableFilter<"BepSettings"> | number | null
    manualInvestment?: FloatNullableFilter<"BepSettings"> | number | null
    targetPaybackMonths?: IntFilter<"BepSettings"> | number
    createdAt?: DateTimeFilter<"BepSettings"> | Date | string
    updatedAt?: DateTimeFilter<"BepSettings"> | Date | string
    outlet?: XOR<OutletScalarRelationFilter, OutletWhereInput>
  }, "id" | "outletId">

  export type BepSettingsOrderByWithAggregationInput = {
    id?: SortOrder
    outletId?: SortOrder
    operationalDays?: SortOrder
    manualOpex?: SortOrderInput | SortOrder
    manualMargin?: SortOrderInput | SortOrder
    manualPrice?: SortOrderInput | SortOrder
    actualVolume?: SortOrderInput | SortOrder
    manualInvestment?: SortOrderInput | SortOrder
    targetPaybackMonths?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: BepSettingsCountOrderByAggregateInput
    _avg?: BepSettingsAvgOrderByAggregateInput
    _max?: BepSettingsMaxOrderByAggregateInput
    _min?: BepSettingsMinOrderByAggregateInput
    _sum?: BepSettingsSumOrderByAggregateInput
  }

  export type BepSettingsScalarWhereWithAggregatesInput = {
    AND?: BepSettingsScalarWhereWithAggregatesInput | BepSettingsScalarWhereWithAggregatesInput[]
    OR?: BepSettingsScalarWhereWithAggregatesInput[]
    NOT?: BepSettingsScalarWhereWithAggregatesInput | BepSettingsScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"BepSettings"> | string
    outletId?: StringWithAggregatesFilter<"BepSettings"> | string
    operationalDays?: IntWithAggregatesFilter<"BepSettings"> | number
    manualOpex?: FloatNullableWithAggregatesFilter<"BepSettings"> | number | null
    manualMargin?: FloatNullableWithAggregatesFilter<"BepSettings"> | number | null
    manualPrice?: FloatNullableWithAggregatesFilter<"BepSettings"> | number | null
    actualVolume?: IntNullableWithAggregatesFilter<"BepSettings"> | number | null
    manualInvestment?: FloatNullableWithAggregatesFilter<"BepSettings"> | number | null
    targetPaybackMonths?: IntWithAggregatesFilter<"BepSettings"> | number
    createdAt?: DateTimeWithAggregatesFilter<"BepSettings"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"BepSettings"> | Date | string
  }

  export type OutletCreateInput = {
    id?: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    menus?: MenuCreateNestedManyWithoutOutletInput
    opexProfiles?: OpexProfileCreateNestedManyWithoutOutletInput
    bepSettings?: BepSettingsCreateNestedOneWithoutOutletInput
  }

  export type OutletUncheckedCreateInput = {
    id?: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    menus?: MenuUncheckedCreateNestedManyWithoutOutletInput
    opexProfiles?: OpexProfileUncheckedCreateNestedManyWithoutOutletInput
    bepSettings?: BepSettingsUncheckedCreateNestedOneWithoutOutletInput
  }

  export type OutletUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    menus?: MenuUpdateManyWithoutOutletNestedInput
    opexProfiles?: OpexProfileUpdateManyWithoutOutletNestedInput
    bepSettings?: BepSettingsUpdateOneWithoutOutletNestedInput
  }

  export type OutletUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    menus?: MenuUncheckedUpdateManyWithoutOutletNestedInput
    opexProfiles?: OpexProfileUncheckedUpdateManyWithoutOutletNestedInput
    bepSettings?: BepSettingsUncheckedUpdateOneWithoutOutletNestedInput
  }

  export type OutletCreateManyInput = {
    id?: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OutletUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OutletUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MenuCreateInput = {
    id?: string
    name: string
    emoji?: string
    category?: string
    margin?: number
    ingredients: JsonNullValueInput | InputJsonValue
    packaging: JsonNullValueInput | InputJsonValue
    ops?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    outlet?: OutletCreateNestedOneWithoutMenusInput
  }

  export type MenuUncheckedCreateInput = {
    id?: string
    name: string
    emoji?: string
    category?: string
    margin?: number
    ingredients: JsonNullValueInput | InputJsonValue
    packaging: JsonNullValueInput | InputJsonValue
    ops?: NullableJsonNullValueInput | InputJsonValue
    outletId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MenuUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    emoji?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    margin?: FloatFieldUpdateOperationsInput | number
    ingredients?: JsonNullValueInput | InputJsonValue
    packaging?: JsonNullValueInput | InputJsonValue
    ops?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    outlet?: OutletUpdateOneWithoutMenusNestedInput
  }

  export type MenuUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    emoji?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    margin?: FloatFieldUpdateOperationsInput | number
    ingredients?: JsonNullValueInput | InputJsonValue
    packaging?: JsonNullValueInput | InputJsonValue
    ops?: NullableJsonNullValueInput | InputJsonValue
    outletId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MenuCreateManyInput = {
    id?: string
    name: string
    emoji?: string
    category?: string
    margin?: number
    ingredients: JsonNullValueInput | InputJsonValue
    packaging: JsonNullValueInput | InputJsonValue
    ops?: NullableJsonNullValueInput | InputJsonValue
    outletId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MenuUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    emoji?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    margin?: FloatFieldUpdateOperationsInput | number
    ingredients?: JsonNullValueInput | InputJsonValue
    packaging?: JsonNullValueInput | InputJsonValue
    ops?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MenuUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    emoji?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    margin?: FloatFieldUpdateOperationsInput | number
    ingredients?: JsonNullValueInput | InputJsonValue
    packaging?: JsonNullValueInput | InputJsonValue
    ops?: NullableJsonNullValueInput | InputJsonValue
    outletId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OpexProfileCreateInput = {
    id?: string
    name: string
    usePenyusutan?: boolean
    penyusutan?: number
    isTotalVolumeLocked?: boolean
    totalVolume?: number
    menuVolumes: JsonNullValueInput | InputJsonValue
    menuPrices: JsonNullValueInput | InputJsonValue
    selectedMenuIds: JsonNullValueInput | InputJsonValue
    assets: JsonNullValueInput | InputJsonValue
    expenses: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    outlet?: OutletCreateNestedOneWithoutOpexProfilesInput
  }

  export type OpexProfileUncheckedCreateInput = {
    id?: string
    name: string
    usePenyusutan?: boolean
    penyusutan?: number
    isTotalVolumeLocked?: boolean
    totalVolume?: number
    menuVolumes: JsonNullValueInput | InputJsonValue
    menuPrices: JsonNullValueInput | InputJsonValue
    selectedMenuIds: JsonNullValueInput | InputJsonValue
    assets: JsonNullValueInput | InputJsonValue
    expenses: JsonNullValueInput | InputJsonValue
    outletId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OpexProfileUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    usePenyusutan?: BoolFieldUpdateOperationsInput | boolean
    penyusutan?: FloatFieldUpdateOperationsInput | number
    isTotalVolumeLocked?: BoolFieldUpdateOperationsInput | boolean
    totalVolume?: IntFieldUpdateOperationsInput | number
    menuVolumes?: JsonNullValueInput | InputJsonValue
    menuPrices?: JsonNullValueInput | InputJsonValue
    selectedMenuIds?: JsonNullValueInput | InputJsonValue
    assets?: JsonNullValueInput | InputJsonValue
    expenses?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    outlet?: OutletUpdateOneWithoutOpexProfilesNestedInput
  }

  export type OpexProfileUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    usePenyusutan?: BoolFieldUpdateOperationsInput | boolean
    penyusutan?: FloatFieldUpdateOperationsInput | number
    isTotalVolumeLocked?: BoolFieldUpdateOperationsInput | boolean
    totalVolume?: IntFieldUpdateOperationsInput | number
    menuVolumes?: JsonNullValueInput | InputJsonValue
    menuPrices?: JsonNullValueInput | InputJsonValue
    selectedMenuIds?: JsonNullValueInput | InputJsonValue
    assets?: JsonNullValueInput | InputJsonValue
    expenses?: JsonNullValueInput | InputJsonValue
    outletId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OpexProfileCreateManyInput = {
    id?: string
    name: string
    usePenyusutan?: boolean
    penyusutan?: number
    isTotalVolumeLocked?: boolean
    totalVolume?: number
    menuVolumes: JsonNullValueInput | InputJsonValue
    menuPrices: JsonNullValueInput | InputJsonValue
    selectedMenuIds: JsonNullValueInput | InputJsonValue
    assets: JsonNullValueInput | InputJsonValue
    expenses: JsonNullValueInput | InputJsonValue
    outletId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OpexProfileUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    usePenyusutan?: BoolFieldUpdateOperationsInput | boolean
    penyusutan?: FloatFieldUpdateOperationsInput | number
    isTotalVolumeLocked?: BoolFieldUpdateOperationsInput | boolean
    totalVolume?: IntFieldUpdateOperationsInput | number
    menuVolumes?: JsonNullValueInput | InputJsonValue
    menuPrices?: JsonNullValueInput | InputJsonValue
    selectedMenuIds?: JsonNullValueInput | InputJsonValue
    assets?: JsonNullValueInput | InputJsonValue
    expenses?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OpexProfileUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    usePenyusutan?: BoolFieldUpdateOperationsInput | boolean
    penyusutan?: FloatFieldUpdateOperationsInput | number
    isTotalVolumeLocked?: BoolFieldUpdateOperationsInput | boolean
    totalVolume?: IntFieldUpdateOperationsInput | number
    menuVolumes?: JsonNullValueInput | InputJsonValue
    menuPrices?: JsonNullValueInput | InputJsonValue
    selectedMenuIds?: JsonNullValueInput | InputJsonValue
    assets?: JsonNullValueInput | InputJsonValue
    expenses?: JsonNullValueInput | InputJsonValue
    outletId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BepSettingsCreateInput = {
    id?: string
    operationalDays?: number
    manualOpex?: number | null
    manualMargin?: number | null
    manualPrice?: number | null
    actualVolume?: number | null
    manualInvestment?: number | null
    targetPaybackMonths?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    outlet: OutletCreateNestedOneWithoutBepSettingsInput
  }

  export type BepSettingsUncheckedCreateInput = {
    id?: string
    outletId: string
    operationalDays?: number
    manualOpex?: number | null
    manualMargin?: number | null
    manualPrice?: number | null
    actualVolume?: number | null
    manualInvestment?: number | null
    targetPaybackMonths?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BepSettingsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    operationalDays?: IntFieldUpdateOperationsInput | number
    manualOpex?: NullableFloatFieldUpdateOperationsInput | number | null
    manualMargin?: NullableFloatFieldUpdateOperationsInput | number | null
    manualPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    actualVolume?: NullableIntFieldUpdateOperationsInput | number | null
    manualInvestment?: NullableFloatFieldUpdateOperationsInput | number | null
    targetPaybackMonths?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    outlet?: OutletUpdateOneRequiredWithoutBepSettingsNestedInput
  }

  export type BepSettingsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    outletId?: StringFieldUpdateOperationsInput | string
    operationalDays?: IntFieldUpdateOperationsInput | number
    manualOpex?: NullableFloatFieldUpdateOperationsInput | number | null
    manualMargin?: NullableFloatFieldUpdateOperationsInput | number | null
    manualPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    actualVolume?: NullableIntFieldUpdateOperationsInput | number | null
    manualInvestment?: NullableFloatFieldUpdateOperationsInput | number | null
    targetPaybackMonths?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BepSettingsCreateManyInput = {
    id?: string
    outletId: string
    operationalDays?: number
    manualOpex?: number | null
    manualMargin?: number | null
    manualPrice?: number | null
    actualVolume?: number | null
    manualInvestment?: number | null
    targetPaybackMonths?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BepSettingsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    operationalDays?: IntFieldUpdateOperationsInput | number
    manualOpex?: NullableFloatFieldUpdateOperationsInput | number | null
    manualMargin?: NullableFloatFieldUpdateOperationsInput | number | null
    manualPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    actualVolume?: NullableIntFieldUpdateOperationsInput | number | null
    manualInvestment?: NullableFloatFieldUpdateOperationsInput | number | null
    targetPaybackMonths?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BepSettingsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    outletId?: StringFieldUpdateOperationsInput | string
    operationalDays?: IntFieldUpdateOperationsInput | number
    manualOpex?: NullableFloatFieldUpdateOperationsInput | number | null
    manualMargin?: NullableFloatFieldUpdateOperationsInput | number | null
    manualPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    actualVolume?: NullableIntFieldUpdateOperationsInput | number | null
    manualInvestment?: NullableFloatFieldUpdateOperationsInput | number | null
    targetPaybackMonths?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type MenuListRelationFilter = {
    every?: MenuWhereInput
    some?: MenuWhereInput
    none?: MenuWhereInput
  }

  export type OpexProfileListRelationFilter = {
    every?: OpexProfileWhereInput
    some?: OpexProfileWhereInput
    none?: OpexProfileWhereInput
  }

  export type BepSettingsNullableScalarRelationFilter = {
    is?: BepSettingsWhereInput | null
    isNot?: BepSettingsWhereInput | null
  }

  export type MenuOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OpexProfileOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OutletOrderByRelevanceInput = {
    fields: OutletOrderByRelevanceFieldEnum | OutletOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type OutletCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OutletMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OutletMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type OutletNullableScalarRelationFilter = {
    is?: OutletWhereInput | null
    isNot?: OutletWhereInput | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type MenuOrderByRelevanceInput = {
    fields: MenuOrderByRelevanceFieldEnum | MenuOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type MenuCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    emoji?: SortOrder
    category?: SortOrder
    margin?: SortOrder
    ingredients?: SortOrder
    packaging?: SortOrder
    ops?: SortOrder
    outletId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MenuAvgOrderByAggregateInput = {
    margin?: SortOrder
  }

  export type MenuMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    emoji?: SortOrder
    category?: SortOrder
    margin?: SortOrder
    outletId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MenuMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    emoji?: SortOrder
    category?: SortOrder
    margin?: SortOrder
    outletId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MenuSumOrderByAggregateInput = {
    margin?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type OpexProfileOrderByRelevanceInput = {
    fields: OpexProfileOrderByRelevanceFieldEnum | OpexProfileOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type OpexProfileCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    usePenyusutan?: SortOrder
    penyusutan?: SortOrder
    isTotalVolumeLocked?: SortOrder
    totalVolume?: SortOrder
    menuVolumes?: SortOrder
    menuPrices?: SortOrder
    selectedMenuIds?: SortOrder
    assets?: SortOrder
    expenses?: SortOrder
    outletId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OpexProfileAvgOrderByAggregateInput = {
    penyusutan?: SortOrder
    totalVolume?: SortOrder
  }

  export type OpexProfileMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    usePenyusutan?: SortOrder
    penyusutan?: SortOrder
    isTotalVolumeLocked?: SortOrder
    totalVolume?: SortOrder
    outletId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OpexProfileMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    usePenyusutan?: SortOrder
    penyusutan?: SortOrder
    isTotalVolumeLocked?: SortOrder
    totalVolume?: SortOrder
    outletId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OpexProfileSumOrderByAggregateInput = {
    penyusutan?: SortOrder
    totalVolume?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type OutletScalarRelationFilter = {
    is?: OutletWhereInput
    isNot?: OutletWhereInput
  }

  export type BepSettingsOrderByRelevanceInput = {
    fields: BepSettingsOrderByRelevanceFieldEnum | BepSettingsOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type BepSettingsCountOrderByAggregateInput = {
    id?: SortOrder
    outletId?: SortOrder
    operationalDays?: SortOrder
    manualOpex?: SortOrder
    manualMargin?: SortOrder
    manualPrice?: SortOrder
    actualVolume?: SortOrder
    manualInvestment?: SortOrder
    targetPaybackMonths?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BepSettingsAvgOrderByAggregateInput = {
    operationalDays?: SortOrder
    manualOpex?: SortOrder
    manualMargin?: SortOrder
    manualPrice?: SortOrder
    actualVolume?: SortOrder
    manualInvestment?: SortOrder
    targetPaybackMonths?: SortOrder
  }

  export type BepSettingsMaxOrderByAggregateInput = {
    id?: SortOrder
    outletId?: SortOrder
    operationalDays?: SortOrder
    manualOpex?: SortOrder
    manualMargin?: SortOrder
    manualPrice?: SortOrder
    actualVolume?: SortOrder
    manualInvestment?: SortOrder
    targetPaybackMonths?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BepSettingsMinOrderByAggregateInput = {
    id?: SortOrder
    outletId?: SortOrder
    operationalDays?: SortOrder
    manualOpex?: SortOrder
    manualMargin?: SortOrder
    manualPrice?: SortOrder
    actualVolume?: SortOrder
    manualInvestment?: SortOrder
    targetPaybackMonths?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BepSettingsSumOrderByAggregateInput = {
    operationalDays?: SortOrder
    manualOpex?: SortOrder
    manualMargin?: SortOrder
    manualPrice?: SortOrder
    actualVolume?: SortOrder
    manualInvestment?: SortOrder
    targetPaybackMonths?: SortOrder
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type MenuCreateNestedManyWithoutOutletInput = {
    create?: XOR<MenuCreateWithoutOutletInput, MenuUncheckedCreateWithoutOutletInput> | MenuCreateWithoutOutletInput[] | MenuUncheckedCreateWithoutOutletInput[]
    connectOrCreate?: MenuCreateOrConnectWithoutOutletInput | MenuCreateOrConnectWithoutOutletInput[]
    createMany?: MenuCreateManyOutletInputEnvelope
    connect?: MenuWhereUniqueInput | MenuWhereUniqueInput[]
  }

  export type OpexProfileCreateNestedManyWithoutOutletInput = {
    create?: XOR<OpexProfileCreateWithoutOutletInput, OpexProfileUncheckedCreateWithoutOutletInput> | OpexProfileCreateWithoutOutletInput[] | OpexProfileUncheckedCreateWithoutOutletInput[]
    connectOrCreate?: OpexProfileCreateOrConnectWithoutOutletInput | OpexProfileCreateOrConnectWithoutOutletInput[]
    createMany?: OpexProfileCreateManyOutletInputEnvelope
    connect?: OpexProfileWhereUniqueInput | OpexProfileWhereUniqueInput[]
  }

  export type BepSettingsCreateNestedOneWithoutOutletInput = {
    create?: XOR<BepSettingsCreateWithoutOutletInput, BepSettingsUncheckedCreateWithoutOutletInput>
    connectOrCreate?: BepSettingsCreateOrConnectWithoutOutletInput
    connect?: BepSettingsWhereUniqueInput
  }

  export type MenuUncheckedCreateNestedManyWithoutOutletInput = {
    create?: XOR<MenuCreateWithoutOutletInput, MenuUncheckedCreateWithoutOutletInput> | MenuCreateWithoutOutletInput[] | MenuUncheckedCreateWithoutOutletInput[]
    connectOrCreate?: MenuCreateOrConnectWithoutOutletInput | MenuCreateOrConnectWithoutOutletInput[]
    createMany?: MenuCreateManyOutletInputEnvelope
    connect?: MenuWhereUniqueInput | MenuWhereUniqueInput[]
  }

  export type OpexProfileUncheckedCreateNestedManyWithoutOutletInput = {
    create?: XOR<OpexProfileCreateWithoutOutletInput, OpexProfileUncheckedCreateWithoutOutletInput> | OpexProfileCreateWithoutOutletInput[] | OpexProfileUncheckedCreateWithoutOutletInput[]
    connectOrCreate?: OpexProfileCreateOrConnectWithoutOutletInput | OpexProfileCreateOrConnectWithoutOutletInput[]
    createMany?: OpexProfileCreateManyOutletInputEnvelope
    connect?: OpexProfileWhereUniqueInput | OpexProfileWhereUniqueInput[]
  }

  export type BepSettingsUncheckedCreateNestedOneWithoutOutletInput = {
    create?: XOR<BepSettingsCreateWithoutOutletInput, BepSettingsUncheckedCreateWithoutOutletInput>
    connectOrCreate?: BepSettingsCreateOrConnectWithoutOutletInput
    connect?: BepSettingsWhereUniqueInput
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type MenuUpdateManyWithoutOutletNestedInput = {
    create?: XOR<MenuCreateWithoutOutletInput, MenuUncheckedCreateWithoutOutletInput> | MenuCreateWithoutOutletInput[] | MenuUncheckedCreateWithoutOutletInput[]
    connectOrCreate?: MenuCreateOrConnectWithoutOutletInput | MenuCreateOrConnectWithoutOutletInput[]
    upsert?: MenuUpsertWithWhereUniqueWithoutOutletInput | MenuUpsertWithWhereUniqueWithoutOutletInput[]
    createMany?: MenuCreateManyOutletInputEnvelope
    set?: MenuWhereUniqueInput | MenuWhereUniqueInput[]
    disconnect?: MenuWhereUniqueInput | MenuWhereUniqueInput[]
    delete?: MenuWhereUniqueInput | MenuWhereUniqueInput[]
    connect?: MenuWhereUniqueInput | MenuWhereUniqueInput[]
    update?: MenuUpdateWithWhereUniqueWithoutOutletInput | MenuUpdateWithWhereUniqueWithoutOutletInput[]
    updateMany?: MenuUpdateManyWithWhereWithoutOutletInput | MenuUpdateManyWithWhereWithoutOutletInput[]
    deleteMany?: MenuScalarWhereInput | MenuScalarWhereInput[]
  }

  export type OpexProfileUpdateManyWithoutOutletNestedInput = {
    create?: XOR<OpexProfileCreateWithoutOutletInput, OpexProfileUncheckedCreateWithoutOutletInput> | OpexProfileCreateWithoutOutletInput[] | OpexProfileUncheckedCreateWithoutOutletInput[]
    connectOrCreate?: OpexProfileCreateOrConnectWithoutOutletInput | OpexProfileCreateOrConnectWithoutOutletInput[]
    upsert?: OpexProfileUpsertWithWhereUniqueWithoutOutletInput | OpexProfileUpsertWithWhereUniqueWithoutOutletInput[]
    createMany?: OpexProfileCreateManyOutletInputEnvelope
    set?: OpexProfileWhereUniqueInput | OpexProfileWhereUniqueInput[]
    disconnect?: OpexProfileWhereUniqueInput | OpexProfileWhereUniqueInput[]
    delete?: OpexProfileWhereUniqueInput | OpexProfileWhereUniqueInput[]
    connect?: OpexProfileWhereUniqueInput | OpexProfileWhereUniqueInput[]
    update?: OpexProfileUpdateWithWhereUniqueWithoutOutletInput | OpexProfileUpdateWithWhereUniqueWithoutOutletInput[]
    updateMany?: OpexProfileUpdateManyWithWhereWithoutOutletInput | OpexProfileUpdateManyWithWhereWithoutOutletInput[]
    deleteMany?: OpexProfileScalarWhereInput | OpexProfileScalarWhereInput[]
  }

  export type BepSettingsUpdateOneWithoutOutletNestedInput = {
    create?: XOR<BepSettingsCreateWithoutOutletInput, BepSettingsUncheckedCreateWithoutOutletInput>
    connectOrCreate?: BepSettingsCreateOrConnectWithoutOutletInput
    upsert?: BepSettingsUpsertWithoutOutletInput
    disconnect?: BepSettingsWhereInput | boolean
    delete?: BepSettingsWhereInput | boolean
    connect?: BepSettingsWhereUniqueInput
    update?: XOR<XOR<BepSettingsUpdateToOneWithWhereWithoutOutletInput, BepSettingsUpdateWithoutOutletInput>, BepSettingsUncheckedUpdateWithoutOutletInput>
  }

  export type MenuUncheckedUpdateManyWithoutOutletNestedInput = {
    create?: XOR<MenuCreateWithoutOutletInput, MenuUncheckedCreateWithoutOutletInput> | MenuCreateWithoutOutletInput[] | MenuUncheckedCreateWithoutOutletInput[]
    connectOrCreate?: MenuCreateOrConnectWithoutOutletInput | MenuCreateOrConnectWithoutOutletInput[]
    upsert?: MenuUpsertWithWhereUniqueWithoutOutletInput | MenuUpsertWithWhereUniqueWithoutOutletInput[]
    createMany?: MenuCreateManyOutletInputEnvelope
    set?: MenuWhereUniqueInput | MenuWhereUniqueInput[]
    disconnect?: MenuWhereUniqueInput | MenuWhereUniqueInput[]
    delete?: MenuWhereUniqueInput | MenuWhereUniqueInput[]
    connect?: MenuWhereUniqueInput | MenuWhereUniqueInput[]
    update?: MenuUpdateWithWhereUniqueWithoutOutletInput | MenuUpdateWithWhereUniqueWithoutOutletInput[]
    updateMany?: MenuUpdateManyWithWhereWithoutOutletInput | MenuUpdateManyWithWhereWithoutOutletInput[]
    deleteMany?: MenuScalarWhereInput | MenuScalarWhereInput[]
  }

  export type OpexProfileUncheckedUpdateManyWithoutOutletNestedInput = {
    create?: XOR<OpexProfileCreateWithoutOutletInput, OpexProfileUncheckedCreateWithoutOutletInput> | OpexProfileCreateWithoutOutletInput[] | OpexProfileUncheckedCreateWithoutOutletInput[]
    connectOrCreate?: OpexProfileCreateOrConnectWithoutOutletInput | OpexProfileCreateOrConnectWithoutOutletInput[]
    upsert?: OpexProfileUpsertWithWhereUniqueWithoutOutletInput | OpexProfileUpsertWithWhereUniqueWithoutOutletInput[]
    createMany?: OpexProfileCreateManyOutletInputEnvelope
    set?: OpexProfileWhereUniqueInput | OpexProfileWhereUniqueInput[]
    disconnect?: OpexProfileWhereUniqueInput | OpexProfileWhereUniqueInput[]
    delete?: OpexProfileWhereUniqueInput | OpexProfileWhereUniqueInput[]
    connect?: OpexProfileWhereUniqueInput | OpexProfileWhereUniqueInput[]
    update?: OpexProfileUpdateWithWhereUniqueWithoutOutletInput | OpexProfileUpdateWithWhereUniqueWithoutOutletInput[]
    updateMany?: OpexProfileUpdateManyWithWhereWithoutOutletInput | OpexProfileUpdateManyWithWhereWithoutOutletInput[]
    deleteMany?: OpexProfileScalarWhereInput | OpexProfileScalarWhereInput[]
  }

  export type BepSettingsUncheckedUpdateOneWithoutOutletNestedInput = {
    create?: XOR<BepSettingsCreateWithoutOutletInput, BepSettingsUncheckedCreateWithoutOutletInput>
    connectOrCreate?: BepSettingsCreateOrConnectWithoutOutletInput
    upsert?: BepSettingsUpsertWithoutOutletInput
    disconnect?: BepSettingsWhereInput | boolean
    delete?: BepSettingsWhereInput | boolean
    connect?: BepSettingsWhereUniqueInput
    update?: XOR<XOR<BepSettingsUpdateToOneWithWhereWithoutOutletInput, BepSettingsUpdateWithoutOutletInput>, BepSettingsUncheckedUpdateWithoutOutletInput>
  }

  export type OutletCreateNestedOneWithoutMenusInput = {
    create?: XOR<OutletCreateWithoutMenusInput, OutletUncheckedCreateWithoutMenusInput>
    connectOrCreate?: OutletCreateOrConnectWithoutMenusInput
    connect?: OutletWhereUniqueInput
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type OutletUpdateOneWithoutMenusNestedInput = {
    create?: XOR<OutletCreateWithoutMenusInput, OutletUncheckedCreateWithoutMenusInput>
    connectOrCreate?: OutletCreateOrConnectWithoutMenusInput
    upsert?: OutletUpsertWithoutMenusInput
    disconnect?: OutletWhereInput | boolean
    delete?: OutletWhereInput | boolean
    connect?: OutletWhereUniqueInput
    update?: XOR<XOR<OutletUpdateToOneWithWhereWithoutMenusInput, OutletUpdateWithoutMenusInput>, OutletUncheckedUpdateWithoutMenusInput>
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type OutletCreateNestedOneWithoutOpexProfilesInput = {
    create?: XOR<OutletCreateWithoutOpexProfilesInput, OutletUncheckedCreateWithoutOpexProfilesInput>
    connectOrCreate?: OutletCreateOrConnectWithoutOpexProfilesInput
    connect?: OutletWhereUniqueInput
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type OutletUpdateOneWithoutOpexProfilesNestedInput = {
    create?: XOR<OutletCreateWithoutOpexProfilesInput, OutletUncheckedCreateWithoutOpexProfilesInput>
    connectOrCreate?: OutletCreateOrConnectWithoutOpexProfilesInput
    upsert?: OutletUpsertWithoutOpexProfilesInput
    disconnect?: OutletWhereInput | boolean
    delete?: OutletWhereInput | boolean
    connect?: OutletWhereUniqueInput
    update?: XOR<XOR<OutletUpdateToOneWithWhereWithoutOpexProfilesInput, OutletUpdateWithoutOpexProfilesInput>, OutletUncheckedUpdateWithoutOpexProfilesInput>
  }

  export type OutletCreateNestedOneWithoutBepSettingsInput = {
    create?: XOR<OutletCreateWithoutBepSettingsInput, OutletUncheckedCreateWithoutBepSettingsInput>
    connectOrCreate?: OutletCreateOrConnectWithoutBepSettingsInput
    connect?: OutletWhereUniqueInput
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type OutletUpdateOneRequiredWithoutBepSettingsNestedInput = {
    create?: XOR<OutletCreateWithoutBepSettingsInput, OutletUncheckedCreateWithoutBepSettingsInput>
    connectOrCreate?: OutletCreateOrConnectWithoutBepSettingsInput
    upsert?: OutletUpsertWithoutBepSettingsInput
    connect?: OutletWhereUniqueInput
    update?: XOR<XOR<OutletUpdateToOneWithWhereWithoutBepSettingsInput, OutletUpdateWithoutBepSettingsInput>, OutletUncheckedUpdateWithoutBepSettingsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type MenuCreateWithoutOutletInput = {
    id?: string
    name: string
    emoji?: string
    category?: string
    margin?: number
    ingredients: JsonNullValueInput | InputJsonValue
    packaging: JsonNullValueInput | InputJsonValue
    ops?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MenuUncheckedCreateWithoutOutletInput = {
    id?: string
    name: string
    emoji?: string
    category?: string
    margin?: number
    ingredients: JsonNullValueInput | InputJsonValue
    packaging: JsonNullValueInput | InputJsonValue
    ops?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MenuCreateOrConnectWithoutOutletInput = {
    where: MenuWhereUniqueInput
    create: XOR<MenuCreateWithoutOutletInput, MenuUncheckedCreateWithoutOutletInput>
  }

  export type MenuCreateManyOutletInputEnvelope = {
    data: MenuCreateManyOutletInput | MenuCreateManyOutletInput[]
    skipDuplicates?: boolean
  }

  export type OpexProfileCreateWithoutOutletInput = {
    id?: string
    name: string
    usePenyusutan?: boolean
    penyusutan?: number
    isTotalVolumeLocked?: boolean
    totalVolume?: number
    menuVolumes: JsonNullValueInput | InputJsonValue
    menuPrices: JsonNullValueInput | InputJsonValue
    selectedMenuIds: JsonNullValueInput | InputJsonValue
    assets: JsonNullValueInput | InputJsonValue
    expenses: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OpexProfileUncheckedCreateWithoutOutletInput = {
    id?: string
    name: string
    usePenyusutan?: boolean
    penyusutan?: number
    isTotalVolumeLocked?: boolean
    totalVolume?: number
    menuVolumes: JsonNullValueInput | InputJsonValue
    menuPrices: JsonNullValueInput | InputJsonValue
    selectedMenuIds: JsonNullValueInput | InputJsonValue
    assets: JsonNullValueInput | InputJsonValue
    expenses: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OpexProfileCreateOrConnectWithoutOutletInput = {
    where: OpexProfileWhereUniqueInput
    create: XOR<OpexProfileCreateWithoutOutletInput, OpexProfileUncheckedCreateWithoutOutletInput>
  }

  export type OpexProfileCreateManyOutletInputEnvelope = {
    data: OpexProfileCreateManyOutletInput | OpexProfileCreateManyOutletInput[]
    skipDuplicates?: boolean
  }

  export type BepSettingsCreateWithoutOutletInput = {
    id?: string
    operationalDays?: number
    manualOpex?: number | null
    manualMargin?: number | null
    manualPrice?: number | null
    actualVolume?: number | null
    manualInvestment?: number | null
    targetPaybackMonths?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BepSettingsUncheckedCreateWithoutOutletInput = {
    id?: string
    operationalDays?: number
    manualOpex?: number | null
    manualMargin?: number | null
    manualPrice?: number | null
    actualVolume?: number | null
    manualInvestment?: number | null
    targetPaybackMonths?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BepSettingsCreateOrConnectWithoutOutletInput = {
    where: BepSettingsWhereUniqueInput
    create: XOR<BepSettingsCreateWithoutOutletInput, BepSettingsUncheckedCreateWithoutOutletInput>
  }

  export type MenuUpsertWithWhereUniqueWithoutOutletInput = {
    where: MenuWhereUniqueInput
    update: XOR<MenuUpdateWithoutOutletInput, MenuUncheckedUpdateWithoutOutletInput>
    create: XOR<MenuCreateWithoutOutletInput, MenuUncheckedCreateWithoutOutletInput>
  }

  export type MenuUpdateWithWhereUniqueWithoutOutletInput = {
    where: MenuWhereUniqueInput
    data: XOR<MenuUpdateWithoutOutletInput, MenuUncheckedUpdateWithoutOutletInput>
  }

  export type MenuUpdateManyWithWhereWithoutOutletInput = {
    where: MenuScalarWhereInput
    data: XOR<MenuUpdateManyMutationInput, MenuUncheckedUpdateManyWithoutOutletInput>
  }

  export type MenuScalarWhereInput = {
    AND?: MenuScalarWhereInput | MenuScalarWhereInput[]
    OR?: MenuScalarWhereInput[]
    NOT?: MenuScalarWhereInput | MenuScalarWhereInput[]
    id?: StringFilter<"Menu"> | string
    name?: StringFilter<"Menu"> | string
    emoji?: StringFilter<"Menu"> | string
    category?: StringFilter<"Menu"> | string
    margin?: FloatFilter<"Menu"> | number
    ingredients?: JsonFilter<"Menu">
    packaging?: JsonFilter<"Menu">
    ops?: JsonNullableFilter<"Menu">
    outletId?: StringNullableFilter<"Menu"> | string | null
    createdAt?: DateTimeFilter<"Menu"> | Date | string
    updatedAt?: DateTimeFilter<"Menu"> | Date | string
  }

  export type OpexProfileUpsertWithWhereUniqueWithoutOutletInput = {
    where: OpexProfileWhereUniqueInput
    update: XOR<OpexProfileUpdateWithoutOutletInput, OpexProfileUncheckedUpdateWithoutOutletInput>
    create: XOR<OpexProfileCreateWithoutOutletInput, OpexProfileUncheckedCreateWithoutOutletInput>
  }

  export type OpexProfileUpdateWithWhereUniqueWithoutOutletInput = {
    where: OpexProfileWhereUniqueInput
    data: XOR<OpexProfileUpdateWithoutOutletInput, OpexProfileUncheckedUpdateWithoutOutletInput>
  }

  export type OpexProfileUpdateManyWithWhereWithoutOutletInput = {
    where: OpexProfileScalarWhereInput
    data: XOR<OpexProfileUpdateManyMutationInput, OpexProfileUncheckedUpdateManyWithoutOutletInput>
  }

  export type OpexProfileScalarWhereInput = {
    AND?: OpexProfileScalarWhereInput | OpexProfileScalarWhereInput[]
    OR?: OpexProfileScalarWhereInput[]
    NOT?: OpexProfileScalarWhereInput | OpexProfileScalarWhereInput[]
    id?: StringFilter<"OpexProfile"> | string
    name?: StringFilter<"OpexProfile"> | string
    usePenyusutan?: BoolFilter<"OpexProfile"> | boolean
    penyusutan?: FloatFilter<"OpexProfile"> | number
    isTotalVolumeLocked?: BoolFilter<"OpexProfile"> | boolean
    totalVolume?: IntFilter<"OpexProfile"> | number
    menuVolumes?: JsonFilter<"OpexProfile">
    menuPrices?: JsonFilter<"OpexProfile">
    selectedMenuIds?: JsonFilter<"OpexProfile">
    assets?: JsonFilter<"OpexProfile">
    expenses?: JsonFilter<"OpexProfile">
    outletId?: StringNullableFilter<"OpexProfile"> | string | null
    createdAt?: DateTimeFilter<"OpexProfile"> | Date | string
    updatedAt?: DateTimeFilter<"OpexProfile"> | Date | string
  }

  export type BepSettingsUpsertWithoutOutletInput = {
    update: XOR<BepSettingsUpdateWithoutOutletInput, BepSettingsUncheckedUpdateWithoutOutletInput>
    create: XOR<BepSettingsCreateWithoutOutletInput, BepSettingsUncheckedCreateWithoutOutletInput>
    where?: BepSettingsWhereInput
  }

  export type BepSettingsUpdateToOneWithWhereWithoutOutletInput = {
    where?: BepSettingsWhereInput
    data: XOR<BepSettingsUpdateWithoutOutletInput, BepSettingsUncheckedUpdateWithoutOutletInput>
  }

  export type BepSettingsUpdateWithoutOutletInput = {
    id?: StringFieldUpdateOperationsInput | string
    operationalDays?: IntFieldUpdateOperationsInput | number
    manualOpex?: NullableFloatFieldUpdateOperationsInput | number | null
    manualMargin?: NullableFloatFieldUpdateOperationsInput | number | null
    manualPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    actualVolume?: NullableIntFieldUpdateOperationsInput | number | null
    manualInvestment?: NullableFloatFieldUpdateOperationsInput | number | null
    targetPaybackMonths?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BepSettingsUncheckedUpdateWithoutOutletInput = {
    id?: StringFieldUpdateOperationsInput | string
    operationalDays?: IntFieldUpdateOperationsInput | number
    manualOpex?: NullableFloatFieldUpdateOperationsInput | number | null
    manualMargin?: NullableFloatFieldUpdateOperationsInput | number | null
    manualPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    actualVolume?: NullableIntFieldUpdateOperationsInput | number | null
    manualInvestment?: NullableFloatFieldUpdateOperationsInput | number | null
    targetPaybackMonths?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OutletCreateWithoutMenusInput = {
    id?: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    opexProfiles?: OpexProfileCreateNestedManyWithoutOutletInput
    bepSettings?: BepSettingsCreateNestedOneWithoutOutletInput
  }

  export type OutletUncheckedCreateWithoutMenusInput = {
    id?: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    opexProfiles?: OpexProfileUncheckedCreateNestedManyWithoutOutletInput
    bepSettings?: BepSettingsUncheckedCreateNestedOneWithoutOutletInput
  }

  export type OutletCreateOrConnectWithoutMenusInput = {
    where: OutletWhereUniqueInput
    create: XOR<OutletCreateWithoutMenusInput, OutletUncheckedCreateWithoutMenusInput>
  }

  export type OutletUpsertWithoutMenusInput = {
    update: XOR<OutletUpdateWithoutMenusInput, OutletUncheckedUpdateWithoutMenusInput>
    create: XOR<OutletCreateWithoutMenusInput, OutletUncheckedCreateWithoutMenusInput>
    where?: OutletWhereInput
  }

  export type OutletUpdateToOneWithWhereWithoutMenusInput = {
    where?: OutletWhereInput
    data: XOR<OutletUpdateWithoutMenusInput, OutletUncheckedUpdateWithoutMenusInput>
  }

  export type OutletUpdateWithoutMenusInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    opexProfiles?: OpexProfileUpdateManyWithoutOutletNestedInput
    bepSettings?: BepSettingsUpdateOneWithoutOutletNestedInput
  }

  export type OutletUncheckedUpdateWithoutMenusInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    opexProfiles?: OpexProfileUncheckedUpdateManyWithoutOutletNestedInput
    bepSettings?: BepSettingsUncheckedUpdateOneWithoutOutletNestedInput
  }

  export type OutletCreateWithoutOpexProfilesInput = {
    id?: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    menus?: MenuCreateNestedManyWithoutOutletInput
    bepSettings?: BepSettingsCreateNestedOneWithoutOutletInput
  }

  export type OutletUncheckedCreateWithoutOpexProfilesInput = {
    id?: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    menus?: MenuUncheckedCreateNestedManyWithoutOutletInput
    bepSettings?: BepSettingsUncheckedCreateNestedOneWithoutOutletInput
  }

  export type OutletCreateOrConnectWithoutOpexProfilesInput = {
    where: OutletWhereUniqueInput
    create: XOR<OutletCreateWithoutOpexProfilesInput, OutletUncheckedCreateWithoutOpexProfilesInput>
  }

  export type OutletUpsertWithoutOpexProfilesInput = {
    update: XOR<OutletUpdateWithoutOpexProfilesInput, OutletUncheckedUpdateWithoutOpexProfilesInput>
    create: XOR<OutletCreateWithoutOpexProfilesInput, OutletUncheckedCreateWithoutOpexProfilesInput>
    where?: OutletWhereInput
  }

  export type OutletUpdateToOneWithWhereWithoutOpexProfilesInput = {
    where?: OutletWhereInput
    data: XOR<OutletUpdateWithoutOpexProfilesInput, OutletUncheckedUpdateWithoutOpexProfilesInput>
  }

  export type OutletUpdateWithoutOpexProfilesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    menus?: MenuUpdateManyWithoutOutletNestedInput
    bepSettings?: BepSettingsUpdateOneWithoutOutletNestedInput
  }

  export type OutletUncheckedUpdateWithoutOpexProfilesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    menus?: MenuUncheckedUpdateManyWithoutOutletNestedInput
    bepSettings?: BepSettingsUncheckedUpdateOneWithoutOutletNestedInput
  }

  export type OutletCreateWithoutBepSettingsInput = {
    id?: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    menus?: MenuCreateNestedManyWithoutOutletInput
    opexProfiles?: OpexProfileCreateNestedManyWithoutOutletInput
  }

  export type OutletUncheckedCreateWithoutBepSettingsInput = {
    id?: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    menus?: MenuUncheckedCreateNestedManyWithoutOutletInput
    opexProfiles?: OpexProfileUncheckedCreateNestedManyWithoutOutletInput
  }

  export type OutletCreateOrConnectWithoutBepSettingsInput = {
    where: OutletWhereUniqueInput
    create: XOR<OutletCreateWithoutBepSettingsInput, OutletUncheckedCreateWithoutBepSettingsInput>
  }

  export type OutletUpsertWithoutBepSettingsInput = {
    update: XOR<OutletUpdateWithoutBepSettingsInput, OutletUncheckedUpdateWithoutBepSettingsInput>
    create: XOR<OutletCreateWithoutBepSettingsInput, OutletUncheckedCreateWithoutBepSettingsInput>
    where?: OutletWhereInput
  }

  export type OutletUpdateToOneWithWhereWithoutBepSettingsInput = {
    where?: OutletWhereInput
    data: XOR<OutletUpdateWithoutBepSettingsInput, OutletUncheckedUpdateWithoutBepSettingsInput>
  }

  export type OutletUpdateWithoutBepSettingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    menus?: MenuUpdateManyWithoutOutletNestedInput
    opexProfiles?: OpexProfileUpdateManyWithoutOutletNestedInput
  }

  export type OutletUncheckedUpdateWithoutBepSettingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    menus?: MenuUncheckedUpdateManyWithoutOutletNestedInput
    opexProfiles?: OpexProfileUncheckedUpdateManyWithoutOutletNestedInput
  }

  export type MenuCreateManyOutletInput = {
    id?: string
    name: string
    emoji?: string
    category?: string
    margin?: number
    ingredients: JsonNullValueInput | InputJsonValue
    packaging: JsonNullValueInput | InputJsonValue
    ops?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OpexProfileCreateManyOutletInput = {
    id?: string
    name: string
    usePenyusutan?: boolean
    penyusutan?: number
    isTotalVolumeLocked?: boolean
    totalVolume?: number
    menuVolumes: JsonNullValueInput | InputJsonValue
    menuPrices: JsonNullValueInput | InputJsonValue
    selectedMenuIds: JsonNullValueInput | InputJsonValue
    assets: JsonNullValueInput | InputJsonValue
    expenses: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MenuUpdateWithoutOutletInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    emoji?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    margin?: FloatFieldUpdateOperationsInput | number
    ingredients?: JsonNullValueInput | InputJsonValue
    packaging?: JsonNullValueInput | InputJsonValue
    ops?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MenuUncheckedUpdateWithoutOutletInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    emoji?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    margin?: FloatFieldUpdateOperationsInput | number
    ingredients?: JsonNullValueInput | InputJsonValue
    packaging?: JsonNullValueInput | InputJsonValue
    ops?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MenuUncheckedUpdateManyWithoutOutletInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    emoji?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    margin?: FloatFieldUpdateOperationsInput | number
    ingredients?: JsonNullValueInput | InputJsonValue
    packaging?: JsonNullValueInput | InputJsonValue
    ops?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OpexProfileUpdateWithoutOutletInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    usePenyusutan?: BoolFieldUpdateOperationsInput | boolean
    penyusutan?: FloatFieldUpdateOperationsInput | number
    isTotalVolumeLocked?: BoolFieldUpdateOperationsInput | boolean
    totalVolume?: IntFieldUpdateOperationsInput | number
    menuVolumes?: JsonNullValueInput | InputJsonValue
    menuPrices?: JsonNullValueInput | InputJsonValue
    selectedMenuIds?: JsonNullValueInput | InputJsonValue
    assets?: JsonNullValueInput | InputJsonValue
    expenses?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OpexProfileUncheckedUpdateWithoutOutletInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    usePenyusutan?: BoolFieldUpdateOperationsInput | boolean
    penyusutan?: FloatFieldUpdateOperationsInput | number
    isTotalVolumeLocked?: BoolFieldUpdateOperationsInput | boolean
    totalVolume?: IntFieldUpdateOperationsInput | number
    menuVolumes?: JsonNullValueInput | InputJsonValue
    menuPrices?: JsonNullValueInput | InputJsonValue
    selectedMenuIds?: JsonNullValueInput | InputJsonValue
    assets?: JsonNullValueInput | InputJsonValue
    expenses?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OpexProfileUncheckedUpdateManyWithoutOutletInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    usePenyusutan?: BoolFieldUpdateOperationsInput | boolean
    penyusutan?: FloatFieldUpdateOperationsInput | number
    isTotalVolumeLocked?: BoolFieldUpdateOperationsInput | boolean
    totalVolume?: IntFieldUpdateOperationsInput | number
    menuVolumes?: JsonNullValueInput | InputJsonValue
    menuPrices?: JsonNullValueInput | InputJsonValue
    selectedMenuIds?: JsonNullValueInput | InputJsonValue
    assets?: JsonNullValueInput | InputJsonValue
    expenses?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}