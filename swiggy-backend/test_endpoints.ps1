$BASE = "http://localhost:8081/api"
$results = @()

function Test-Endpoint {
    param($Method, $Url, $Body, $Token, $Expected, $Label)
    
    $headers = @{ "Content-Type" = "application/json" }
    if ($Token) { $headers["Authorization"] = "Bearer $Token" }
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $headers
            UseBasicParsing = $true
            TimeoutSec = 10
        }
        if ($Body) { $params["Body"] = ($Body | ConvertTo-Json -Depth 5) }
        
        $response = Invoke-WebRequest @params
        $status = $response.StatusCode
        $content = $response.Content
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        if (-not $status) { $status = "ERROR" }
        try {
            $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
            $content = $reader.ReadToEnd()
            $reader.Close()
        } catch { $content = $_.Exception.Message }
    }
    
    $pass = if ($Expected -contains $status) { "PASS" } else { "FAIL" }
    Write-Host ""
    Write-Host "[$pass] $Label" -ForegroundColor $(if ($pass -eq "PASS") { "Green" } else { "Red" })
    Write-Host "  $Method $Url"
    Write-Host "  Status: $status (expected: $($Expected -join '/'))"
    $truncated = if ($content.Length -gt 300) { $content.Substring(0, 300) + "..." } else { $content }
    Write-Host "  Response: $truncated"
    
    return @{ Label=$Label; Status=$status; Pass=$pass; Content=$content }
}

Write-Host "========================================"
Write-Host "  MINI-SWIGGY BACKEND ENDPOINT TESTS"
Write-Host "  Server: $BASE"
Write-Host "========================================"

# =============================================================
# 1. AUTH ENDPOINTS
# =============================================================
Write-Host "`n--- AUTH ENDPOINTS ---"

# 1a. Register a new user
$regResult = Test-Endpoint -Method POST -Url "$BASE/auth/register" `
    -Body @{ name="TestUser"; email="testuser@test.com"; password="test123456" } `
    -Expected @(201, 200, 409) -Label "POST /api/auth/register (new user)"

# 1b. Register duplicate user (should fail)
$dupResult = Test-Endpoint -Method POST -Url "$BASE/auth/register" `
    -Body @{ name="TestUser"; email="testuser@test.com"; password="test123456" } `
    -Expected @(400, 409, 500) -Label "POST /api/auth/register (duplicate - should fail)"

# 1c. Register with invalid data
Test-Endpoint -Method POST -Url "$BASE/auth/register" `
    -Body @{ name=""; email="invalid"; password="12" } `
    -Expected @(400) -Label "POST /api/auth/register (validation error)"

# 1d. Login
$loginResult = Test-Endpoint -Method POST -Url "$BASE/auth/login" `
    -Body @{ email="testuser@test.com"; password="test123456" } `
    -Expected @(200) -Label "POST /api/auth/login"

# Extract JWT token
$TOKEN = ""
if ($loginResult.Content) {
    try {
        $loginData = $loginResult.Content | ConvertFrom-Json
        $TOKEN = $loginData.token
        Write-Host "  >> JWT Token obtained: $($TOKEN.Substring(0, [Math]::Min(30, $TOKEN.Length)))..."
    } catch { Write-Host "  >> Could not parse token" }
}

# 1e. Login with wrong password
Test-Endpoint -Method POST -Url "$BASE/auth/login" `
    -Body @{ email="testuser@test.com"; password="wrongpassword" } `
    -Expected @(401, 403) -Label "POST /api/auth/login (wrong password)"

# 1f. Get current user
Test-Endpoint -Method GET -Url "$BASE/auth/me" -Token $TOKEN `
    -Expected @(200) -Label "GET /api/auth/me (authenticated)"

# 1g. Get current user without token
Test-Endpoint -Method GET -Url "$BASE/auth/me" `
    -Expected @(401, 403) -Label "GET /api/auth/me (no token - should fail)"

# =============================================================
# 2. REGISTER ADMIN USER
# =============================================================
# Register admin user for admin-only tests
$adminRegResult = Test-Endpoint -Method POST -Url "$BASE/auth/register" `
    -Body @{ name="AdminUser"; email="admin@test.com"; password="admin123456" } `
    -Expected @(201, 200, 409) -Label "POST /api/auth/register (admin user)"

# We'll need to manually set the role to ADMIN in the DB or check if there's a way
# For now, let's use the regular user token and test what we can

# =============================================================
# 3. FOOD ENDPOINTS (Public GET)
# =============================================================
Write-Host "`n--- FOOD ENDPOINTS (Public) ---"

# 3a. Get all foods (public, no auth needed)
Test-Endpoint -Method GET -Url "$BASE/foods" `
    -Expected @(200) -Label "GET /api/foods (all foods)"

# 3b. Get foods by category
Test-Endpoint -Method GET -Url "$BASE/foods?category=Pizza" `
    -Expected @(200) -Label "GET /api/foods?category=Pizza"

# 3c. Search foods
Test-Endpoint -Method GET -Url "$BASE/foods?search=chicken" `
    -Expected @(200) -Label "GET /api/foods?search=chicken"

# 3d. Get categories
Test-Endpoint -Method GET -Url "$BASE/foods/categories" `
    -Expected @(200) -Label "GET /api/foods/categories"

# 3e. Get food by ID (may not exist)
Test-Endpoint -Method GET -Url "$BASE/foods/1" `
    -Expected @(200, 404) -Label "GET /api/foods/1"

# =============================================================
# 4. FOOD ENDPOINTS (Admin - will get 403 with regular user)
# =============================================================
Write-Host "`n--- FOOD ENDPOINTS (Admin) ---"

# 4a. Create food (as regular user - should fail)
Test-Endpoint -Method POST -Url "$BASE/foods" -Token $TOKEN `
    -Body @{ name="Test Pizza"; description="Delicious test pizza"; price=9.99; category="Pizza"; imageUrl="https://example.com/pizza.jpg"; isAvailable=$true } `
    -Expected @(403) -Label "POST /api/foods (regular user - should fail 403)"

# 4b. Create food without auth
Test-Endpoint -Method POST -Url "$BASE/foods" `
    -Body @{ name="Test Pizza"; description="Delicious test pizza"; price=9.99; category="Pizza" } `
    -Expected @(401, 403) -Label "POST /api/foods (no auth - should fail)"

# =============================================================
# 5. CART ENDPOINTS (Authenticated)
# =============================================================
Write-Host "`n--- CART ENDPOINTS ---"

# 5a. Get cart
Test-Endpoint -Method GET -Url "$BASE/cart" -Token $TOKEN `
    -Expected @(200) -Label "GET /api/cart (get user cart)"

# 5b. Get cart without auth
Test-Endpoint -Method GET -Url "$BASE/cart" `
    -Expected @(401, 403) -Label "GET /api/cart (no auth - should fail)"

# 5c. Add to cart (if foods exist)
$addCartResult = Test-Endpoint -Method POST -Url "$BASE/cart/add" -Token $TOKEN `
    -Body @{ foodId=1; quantity=2 } `
    -Expected @(200, 404) -Label "POST /api/cart/add (add food to cart)"

# 5d. Update cart item
Test-Endpoint -Method PUT -Url "$BASE/cart/update/1" -Token $TOKEN `
    -Body @{ quantity=3 } `
    -Expected @(200, 404) -Label "PUT /api/cart/update/1 (update quantity)"

# 5e. Remove from cart
Test-Endpoint -Method DELETE -Url "$BASE/cart/remove/1" -Token $TOKEN `
    -Expected @(200, 404) -Label "DELETE /api/cart/remove/1 (remove item)"

# 5f. Clear cart
Test-Endpoint -Method DELETE -Url "$BASE/cart/clear" -Token $TOKEN `
    -Expected @(204, 200) -Label "DELETE /api/cart/clear"

# =============================================================
# 6. ORDER ENDPOINTS (Authenticated)
# =============================================================
Write-Host "`n--- ORDER ENDPOINTS ---"

# 6a. Get orders
Test-Endpoint -Method GET -Url "$BASE/orders" -Token $TOKEN `
    -Expected @(200) -Label "GET /api/orders (my orders)"

# 6b. Get orders without auth
Test-Endpoint -Method GET -Url "$BASE/orders" `
    -Expected @(401, 403) -Label "GET /api/orders (no auth - should fail)"

# 6c. Place order (may fail if cart empty)
$orderResult = Test-Endpoint -Method POST -Url "$BASE/orders/place" -Token $TOKEN `
    -Body @{ deliveryAddress="123 Test Street, City"; paymentMethod="CASH" } `
    -Expected @(201, 200, 400) -Label "POST /api/orders/place"

# 6d. Get order by ID
Test-Endpoint -Method GET -Url "$BASE/orders/1" -Token $TOKEN `
    -Expected @(200, 404) -Label "GET /api/orders/1"

# 6e. Update order status (admin only, regular user should get 403)
Test-Endpoint -Method PUT -Url "$BASE/orders/1/status" -Token $TOKEN `
    -Body @{ status="CONFIRMED" } `
    -Expected @(403) -Label "PUT /api/orders/1/status (regular user - should fail 403)"

# 6f. Update order status without auth
Test-Endpoint -Method PUT -Url "$BASE/orders/1/status" `
    -Body @{ status="CONFIRMED" } `
    -Expected @(401, 403) -Label "PUT /api/orders/1/status (no auth - should fail)"

# =============================================================
# SUMMARY
# =============================================================
Write-Host "`n========================================"
Write-Host "  TEST SUMMARY"
Write-Host "========================================"
Write-Host "All endpoint tests completed!"
Write-Host "Review results above for any FAIL indicators."
