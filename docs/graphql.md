
## root resolver argument

```
facility {
  dataValues:
   { id: '1',
     typeId: '3',
     gameAccountId: '1',
     assetInstanceId: null,
     details: null },
  _previousDataValues:
   { id: '1',
     typeId: '3',
     gameAccountId: '1',
     assetInstanceId: null,
     details: null },
  _changed: {},
  _modelOptions:
   { timestamps: false,
     validate: {},
     freezeTableName: false,
     underscored: false,
     paranoid: false,
     rejectOnEmpty: false,
     whereCollection: { game_account_id: '1' },
     schema: null,
     schemaDelimiter: '',
     defaultScope: {},
     scopes: {},
     indexes: [],
     name: { plural: 'facilities', singular: 'facility' },
     omitNull: false,
     sequelize:
      Sequelize {
        options: [Object],
        config: [Object],
        dialect: [Object],
        queryInterface: [Object],
        models: [Object],
        modelManager: [Object],
        connectionManager: [Object],
        importCache: [Object],
        test: [Object] },
     hooks: {} },
  _options:
   { isNewRecord: false,
     _schema: null,
     _schemaDelimiter: '',
     raw: true,
     attributes: [ 'id', 'typeId', 'gameAccountId', 'assetInstanceId', 'details' ] },
  isNewRecord: false }
```

## info resolver argument

```
{ fieldName: 'blockedType',
  fieldNodes:
   [ { kind: 'Field',
       alias: undefined,
       name: [Object],
       arguments: [],
       directives: [],
       selectionSet: [Object],
       loc: [Object] } ],
  returnType: Type,
  parentType: Facility,
  path: { prev: { prev: [Object], key: 0 }, key: 'blockedType' },
  schema:
   GraphQLSchema {
     __allowedLegacyNames: undefined,
     _queryType: Query,
     _mutationType: Mutation,
     _subscriptionType: null,
     _directives: [ [Object], [Object], [Object] ],
     astNode: undefined,
     _typeMap:
      { Query: Query,
        ID: ID,
        Asset: Asset,
        Type: Type,
        String: String,
        JSON: JSON,
        Location: Location,
        Int: Int,
        Facility: Facility,
        Timer: Timer,
        DateTime: DateTime,
        GameAccount: GameAccount,
        TypeGroup: TypeGroup,
        Mutation: Mutation,
        QueueCraftingInput: QueueCraftingInput,
        AssetQuantityInput: AssetQuantityInput,
        __Schema: __Schema,
        __Type: __Type,
        __TypeKind: __TypeKind,
        Boolean: Boolean,
        __Field: __Field,
        __InputValue: __InputValue,
        __EnumValue: __EnumValue,
        __Directive: __Directive,
        __DirectiveLocation: __DirectiveLocation },
     _implementations: {},
     __validationErrors: [] },
  fragments: {},
  rootValue: undefined,
  operation:
   { kind: 'OperationDefinition',
     operation: 'query',
     name: undefined,
     variableDefinitions: [],
     directives: [],
     selectionSet: { kind: 'SelectionSet', selections: [Array], loc: [Object] },
     loc: { start: 0, end: 101 } },
  variableValues: {} }
```