## Model

Model classes are adapted from previous work on Modinha, updated to use ES6 classes. Tradeoffs are made to favor simplicity over syntax, specifically with respect to class inheritance/extension.

### Model class

### Initializer

### Validator

### Collection

### Resource

Resource extends Model with persistence methods that map very closely to HTTP verbs. Resource instances are stored in Redis hashes.

### Expires

Like Resource, Expires extends Model with persistence methods that store data in Redis. However, Expires instances are NOT stored in a hash, and a TTL is set with Redis' EXPIRES command.

### Consumable

Like Resource and Expires, Consumable extends Model, but it incorporates a different model of interaction with stored values. This class can be used to implement tokens that have an expiration and are intended to be used only once, like EmailVerification, PasswordReset, and AuthorizationCode. Consumable is based on the OneTimeToken model from previous versions of Anvil Connect.
