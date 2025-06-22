# Code Commenting Standards

All comments should follow the [Conventional Comments](https://conventionalcomments.org/) format for clarity and consistency.

## Comment Format

```plaintext
<type>: <message>
```

## Types of Comments

### TODO

Used to mark tasks that need to be completed in the future.

```javascript
// TODO: Implement the API integration for user authentication
```

### FIXME

Used to mark code that needs to be fixed or has known issues.

```javascript
// FIXME: This needs proper error handling for edge cases
```

### HACK

Used to mark temporary workarounds or non-ideal solutions.

```javascript
// HACK: Temporary workaround for browser compatibility issue
```

### NOTE

Used to provide important information or explanations about the code.

```javascript
// NOTE: This function assumes a positive integer input
```

### OPTIMIZE

Used to mark code that could be improved for better performance.

```javascript
// OPTIMIZE: Improve the efficiency of this nested loop
```

### DEPRECATED

Used to mark code that is outdated and should not be used.

```javascript
// DEPRECATED: Use the new authenticateUser() method instead
```

## Best Practices

- Keep comments concise and meaningful
- Update comments when code changes
- Remove completed TODO items
- Use comments to explain "why" not "what"
- Avoid obvious comments
- Use consistent formatting and style

## Examples in Context

```javascript
class UserService {
  // NOTE: This method uses caching to improve performance
  async getUser(id) {
    // TODO: Add input validation
    const cachedUser = this.cache.get(id);
    
    if (cachedUser) {
      return cachedUser;
    }
    
    // FIXME: Handle network timeouts properly
    const user = await this.api.fetchUser(id);
    
    // OPTIMIZE: Consider using a more efficient caching strategy
    this.cache.set(id, user, { ttl: 300 });
    
    return user;
  }
}
