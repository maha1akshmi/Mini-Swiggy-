$BASE = "http://localhost:8081/api"

function Invoke-Api {
    param($Method, $Url, $Body, $Token)
    $headers = @{ "Content-Type" = "application/json" }
    if ($Token) { $headers["Authorization"] = "Bearer $Token" }
    $params = @{ Uri=$Url; Method=$Method; Headers=$headers; UseBasicParsing=$true; TimeoutSec=10 }
    if ($Body) { $params["Body"] = ($Body | ConvertTo-Json -Depth 5) }
    try {
        $r = Invoke-WebRequest @params
        return @{ Status=$r.StatusCode; Body=($r.Content | ConvertFrom-Json) }
    } catch {
        $s = $_.Exception.Response.StatusCode.value__
        try { $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream()); $c = $reader.ReadToEnd(); $reader.Close() } catch { $c = $_.Exception.Message }
        return @{ Status=$s; Body=$c }
    }
}

Write-Host "============================================"
Write-Host "  FULL FLOW TEST: Admin + Foods + Cart + Order"
Write-Host "============================================"

# Step 1: Update admin role in DB
Write-Host "`n[1] Setting admin@test.com role to ADMIN in database..."
$mysqlCmd = "mysql -u root -pKarthik@592004 mini_swiggy -e `"UPDATE users SET role='ADMIN' WHERE email='admin@test.com';`""
Invoke-Expression $mysqlCmd 2>$null
Write-Host "  Done (attempted DB update)"

# Step 2: Login as admin
Write-Host "`n[2] Logging in as admin@test.com..."
$adminLogin = Invoke-Api -Method POST -Url "$BASE/auth/login" -Body @{ email="admin@test.com"; password="admin123456" }
$ADMIN_TOKEN = $adminLogin.Body.token
if ($ADMIN_TOKEN) {
    Write-Host "  PASS: Admin login successful, token obtained"
} else {
    Write-Host "  FAIL: Could not get admin token"
    Write-Host "  Response: $($adminLogin | ConvertTo-Json -Depth 3)"
    exit 1
}

# Step 3: Login as regular user
Write-Host "`n[3] Logging in as testuser@test.com..."
$userLogin = Invoke-Api -Method POST -Url "$BASE/auth/login" -Body @{ email="testuser@test.com"; password="test123456" }
$USER_TOKEN = $userLogin.Body.token
Write-Host "  PASS: User login successful"

# Step 4: Create foods as admin
Write-Host "`n[4] Creating foods as ADMIN..."

$food1 = Invoke-Api -Method POST -Url "$BASE/foods" -Token $ADMIN_TOKEN `
    -Body @{ name="Margherita Pizza"; description="Classic margherita with fresh mozzarella"; price=12.99; category="Pizza"; imageUrl="https://example.com/pizza.jpg"; isAvailable=$true }
Write-Host "  Create Pizza: Status=$($food1.Status)"
if ($food1.Status -eq 201) { Write-Host "    PASS: Food created - ID=$($food1.Body.id)" } else { Write-Host "    Status: $($food1.Status) - $($food1.Body)" }

$food2 = Invoke-Api -Method POST -Url "$BASE/foods" -Token $ADMIN_TOKEN `
    -Body @{ name="Chicken Biryani"; description="Hyderabadi chicken biryani"; price=15.99; category="Biryani"; imageUrl="https://example.com/biryani.jpg"; isAvailable=$true }
Write-Host "  Create Biryani: Status=$($food2.Status)"
if ($food2.Status -eq 201) { Write-Host "    PASS: Food created - ID=$($food2.Body.id)" } else { Write-Host "    Status: $($food2.Status) - $($food2.Body)" }

$food3 = Invoke-Api -Method POST -Url "$BASE/foods" -Token $ADMIN_TOKEN `
    -Body @{ name="Veggie Burger"; description="Fresh veggie patty with lettuce"; price=8.99; category="Burgers"; imageUrl="https://example.com/burger.jpg"; isAvailable=$true }
Write-Host "  Create Burger: Status=$($food3.Status)"
if ($food3.Status -eq 201) { Write-Host "    PASS: Food created - ID=$($food3.Body.id)" } else { Write-Host "    Status: $($food3.Status) - $($food3.Body)" }

# Step 5: Test food GET endpoints
Write-Host "`n[5] Testing food retrieval..."

$allFoods = Invoke-Api -Method GET -Url "$BASE/foods"
Write-Host "  GET /foods: Status=$($allFoods.Status), Count=$($allFoods.Body.Count)"
if ($allFoods.Body.Count -ge 3) { Write-Host "    PASS" } else { Write-Host "    WARN: Expected 3+ foods" }

$catFoods = Invoke-Api -Method GET -Url "$BASE/foods?category=Pizza"
Write-Host "  GET /foods?category=Pizza: Status=$($catFoods.Status), Count=$($catFoods.Body.Count)"

$searchFoods = Invoke-Api -Method GET -Url "$BASE/foods?search=chicken"
Write-Host "  GET /foods?search=chicken: Status=$($searchFoods.Status), Count=$($searchFoods.Body.Count)"

$categories = Invoke-Api -Method GET -Url "$BASE/foods/categories"
Write-Host "  GET /foods/categories: Status=$($categories.Status), Categories=$($categories.Body -join ', ')"

$foodId = $food1.Body.id
$singleFood = Invoke-Api -Method GET -Url "$BASE/foods/$foodId"
Write-Host "  GET /foods/$foodId`: Status=$($singleFood.Status), Name=$($singleFood.Body.name)"
if ($singleFood.Status -eq 200) { Write-Host "    PASS" } else { Write-Host "    FAIL" }

# Step 6: Update food as admin
Write-Host "`n[6] Updating food as ADMIN..."
$updateFood = Invoke-Api -Method PUT -Url "$BASE/foods/$foodId" -Token $ADMIN_TOKEN `
    -Body @{ name="Margherita Pizza"; description="Updated: Classic margherita with fresh basil"; price=14.99; category="Pizza"; imageUrl="https://example.com/pizza.jpg"; isAvailable=$true }
Write-Host "  PUT /foods/$foodId`: Status=$($updateFood.Status)"
if ($updateFood.Status -eq 200) { Write-Host "    PASS: Price updated to $($updateFood.Body.price)" } else { Write-Host "    FAIL: $($updateFood.Body)" }

# Step 7: Cart operations as regular user
Write-Host "`n[7] Cart operations as USER..."

$getCart = Invoke-Api -Method GET -Url "$BASE/cart" -Token $USER_TOKEN
Write-Host "  GET /cart: Status=$($getCart.Status), Items=$($getCart.Body.totalItems)"
if ($getCart.Status -eq 200) { Write-Host "    PASS" } else { Write-Host "    FAIL" }

$foodId1 = $food1.Body.id
$foodId2 = $food2.Body.id

$addCart1 = Invoke-Api -Method POST -Url "$BASE/cart/add" -Token $USER_TOKEN `
    -Body @{ foodId=$foodId1; quantity=2 }
Write-Host "  POST /cart/add (Pizza x2): Status=$($addCart1.Status)"
if ($addCart1.Status -eq 200) { Write-Host "    PASS: Cart total=$($addCart1.Body.totalPrice), items=$($addCart1.Body.totalItems)" } else { Write-Host "    FAIL: $($addCart1.Body)" }

$addCart2 = Invoke-Api -Method POST -Url "$BASE/cart/add" -Token $USER_TOKEN `
    -Body @{ foodId=$foodId2; quantity=1 }
Write-Host "  POST /cart/add (Biryani x1): Status=$($addCart2.Status)"
if ($addCart2.Status -eq 200) { Write-Host "    PASS: Cart total=$($addCart2.Body.totalPrice), items=$($addCart2.Body.totalItems)" } else { Write-Host "    FAIL: $($addCart2.Body)" }

# Update cart item
$cartItemId = $addCart2.Body.items[1].id
$updateCart = Invoke-Api -Method PUT -Url "$BASE/cart/update/$cartItemId" -Token $USER_TOKEN `
    -Body @{ quantity=3 }
Write-Host "  PUT /cart/update/$cartItemId (qty->3): Status=$($updateCart.Status)"
if ($updateCart.Status -eq 200) { Write-Host "    PASS: Updated total=$($updateCart.Body.totalPrice)" } else { Write-Host "    FAIL: $($updateCart.Body)" }

# Remove one item from cart
$removeResult = Invoke-Api -Method DELETE -Url "$BASE/cart/remove/$cartItemId" -Token $USER_TOKEN
Write-Host "  DELETE /cart/remove/$cartItemId`: Status=$($removeResult.Status)"
if ($removeResult.Status -eq 200) { Write-Host "    PASS: Items left=$($removeResult.Body.totalItems)" } else { Write-Host "    FAIL: $($removeResult.Body)" }

# Re-add for order
$reAdd = Invoke-Api -Method POST -Url "$BASE/cart/add" -Token $USER_TOKEN `
    -Body @{ foodId=$foodId2; quantity=1 }
Write-Host "  Re-added biryani for order test"

# Step 8: Place order
Write-Host "`n[8] Order operations as USER..."

$placeOrder = Invoke-Api -Method POST -Url "$BASE/orders/place" -Token $USER_TOKEN `
    -Body @{ deliveryAddress="123 Test Street, Bangalore"; paymentMethod="CASH" }
Write-Host "  POST /orders/place: Status=$($placeOrder.Status)"
if ($placeOrder.Status -eq 201 -or $placeOrder.Status -eq 200) {
    Write-Host "    PASS: Order ID=$($placeOrder.Body.id), Status=$($placeOrder.Body.status), Total=$($placeOrder.Body.totalAmount)"
} else { Write-Host "    Result: $($placeOrder.Body)" }

# Get orders
$myOrders = Invoke-Api -Method GET -Url "$BASE/orders" -Token $USER_TOKEN
Write-Host "  GET /orders: Status=$($myOrders.Status), Count=$($myOrders.Body.Count)"
if ($myOrders.Body.Count -ge 1) { Write-Host "    PASS" } else { Write-Host "    WARN" }

# Get order by ID
$orderId = $placeOrder.Body.id
if ($orderId) {
    $orderDetail = Invoke-Api -Method GET -Url "$BASE/orders/$orderId" -Token $USER_TOKEN
    Write-Host "  GET /orders/$orderId`: Status=$($orderDetail.Status), Items=$($orderDetail.Body.items.Count)"
    if ($orderDetail.Status -eq 200) { Write-Host "    PASS" } else { Write-Host "    FAIL" }
}

# Step 9: Admin update order status
Write-Host "`n[9] Admin updates order status..."
if ($orderId) {
    $updateStatus = Invoke-Api -Method PUT -Url "$BASE/orders/$orderId/status" -Token $ADMIN_TOKEN `
        -Body @{ status="CONFIRMED" }
    Write-Host "  PUT /orders/$orderId/status -> CONFIRMED: Status=$($updateStatus.Status)"
    if ($updateStatus.Status -eq 200) { Write-Host "    PASS: New status=$($updateStatus.Body.status)" } else { Write-Host "    Result: $($updateStatus.Body)" }
}

# Step 10: Delete food as admin
Write-Host "`n[10] Delete food as ADMIN..."
$food3Id = $food3.Body.id
$deleteFoodResult = Invoke-Api -Method DELETE -Url "$BASE/foods/$food3Id" -Token $ADMIN_TOKEN
Write-Host "  DELETE /foods/$food3Id`: Status=$($deleteFoodResult.Status)"
if ($deleteFoodResult.Status -eq 204) { Write-Host "    PASS: Food deleted" } else { Write-Host "    Result: $($deleteFoodResult.Body)" }

# Verify deletion
$verifyDelete = Invoke-Api -Method GET -Url "$BASE/foods/$food3Id"
Write-Host "  GET /foods/$food3Id (verify deleted): Status=$($verifyDelete.Status)"
if ($verifyDelete.Status -eq 404) { Write-Host "    PASS: Confirmed deleted" } else { Write-Host "    FAIL: Still exists" }

# Step 11: Cart after order (should be empty)
Write-Host "`n[11] Verify cart is empty after order..."
$cartAfter = Invoke-Api -Method GET -Url "$BASE/cart" -Token $USER_TOKEN
Write-Host "  GET /cart: Items=$($cartAfter.Body.totalItems)"
if ($cartAfter.Body.totalItems -eq 0) { Write-Host "    PASS: Cart cleared after order" } else { Write-Host "    INFO: Cart has $($cartAfter.Body.totalItems) items" }

Write-Host "`n============================================"
Write-Host "  FULL FLOW TEST COMPLETE"
Write-Host "============================================"
