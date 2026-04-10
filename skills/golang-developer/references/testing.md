# Testing Patterns Reference

## Table of Contents

1. [Test Organization](#test-organization)
2. [Manual Mocks with testify](#manual-mocks-with-testify)
3. [Table-Driven Tests](#table-driven-tests)
4. [Testing Triple Returns](#testing-triple-returns)
5. [Running Tests](#running-tests)
6. [Key Rules](#key-rules)

## Test Organization

Tests live in a **separate `test/` directory** from source code to avoid import cycles.

**Package Naming:**
- Use `controller_test` for controller tests
- Use `service_test` for service tests
- Use `repository_test` for repository tests

**File Naming:**
- Pattern: `Test[Component]_[Method]_[Scenario]`
- Example: `TestOrderController_CreateOrder_Success`

**Build Tags (optional):**
```go
//go:build grpc_legacy
// +build grpc_legacy

package controller_test
```

## Manual Mocks with testify

The codebase uses **manual mock structs** implementing service/repository interfaces. Mocks use `testify/mock` for assertion.

**Mock Definition Pattern:**

Mocks are **hand-written inline** in each test file, not in a separate directory. No code generation tools (gomock, mockery) are used.

```go
// Defined inline at the top of each test file
type MockOrderService struct {
    mock.Mock
}

func (m *MockOrderService) Create(
    ctx context.Context,
    params service.CreateOrderParams,
) (*entity.Order, error, []service.ParamError) {
    args := m.Called(ctx, params)
    var result *entity.Order
    if args.Get(0) != nil {
        result = args.Get(0).(*entity.Order)
    }
    var paramErrs []service.ParamError
    if args.Get(2) != nil {
        paramErrs = args.Get(2).([]service.ParamError)
    }
    return result, args.Error(1), paramErrs
}
```

**Critical:** Match the interface signature **exactly**, including the triple return pattern.

## Table-Driven Tests

Every test function **must** use table-driven tests. Structure with `[]struct` containing test cases, setup functions, and assertions.

**Pattern:**

```go
func TestOrderController_CreateOrder(t *testing.T) {
    tests := []struct {
        name      string
        request   *nav.CreateOrderRequest
        setupMock func(*MockOrderService, *MockValidator, *MockTransformer)
        wantStatus bool
        wantCode  string
        wantErr   bool
    }{
        {
            name: "successful creation",
            request: &nav.CreateOrderRequest{
                TenantId: 1,
                Amount:   "1000.00",
            },
            setupMock: func(svc *MockOrderService, val *MockValidator, tf *MockTransformer) {
                order := &entity.Order{
                    BaseEntitySF: entity.BaseEntitySF{ID: 12345},
                    Status:       "pending",
                }
                svc.On("CreateOrder", mock.Anything, mock.AnythingOfType("CreateOrderParams")).
                    Return(order, nil, nil)
                tf.On("TransformOrder", order).
                    Return(&nav.Order{Id: 12345})
            },
            wantStatus: true,
            wantCode:   "0000000",
        },
        {
            name: "validation error",
            request: &nav.CreateOrderRequest{TenantId: 1},
            setupMock: func(svc *MockOrderService, val *MockValidator, tf *MockTransformer) {
                svc.On("CreateOrder", mock.Anything, mock.Anything).
                    Return(nil, nil, []service.ParamError{
                        {Field: "amount", Message: "required"},
                    })
            },
            wantStatus: false,
            wantCode:   "G-SYS-E-GEN-002",
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            svc := new(MockOrderService)
            val := new(MockValidator)
            tf := new(MockTransformer)
            tt.setupMock(svc, val, tf)

            ctrl := controller.NewOrderController(svc, val, tf)
            resp, err := ctrl.CreateOrder(context.Background(), tt.request)

            if tt.wantErr {
                assert.Error(t, err)
                return
            }
            assert.NoError(t, err)
            assert.Equal(t, tt.wantStatus, resp.Status)

            svc.AssertExpectations(t)
            val.AssertExpectations(t)
            tf.AssertExpectations(t)
        })
    }
}
```

## Testing Triple Returns

Services return `(result, error, paramErrors)`. All three must be tested separately.

**Success Case:**
```go
result, err, paramErrs := svc.CreateOrder(ctx, validParams)
assert.NotNil(t, result)
assert.NoError(t, err)
assert.Nil(t, paramErrs)
```

**Validation Error** (param error, NOT system error):
```go
result, err, paramErrs := svc.CreateOrder(ctx, invalidParams)
assert.Nil(t, result)
assert.NoError(t, err)           // No system error
assert.NotEmpty(t, paramErrs)    // But param errors present
```

**System Error:**
```go
result, err, paramErrs := svc.CreateOrder(ctx, paramsWithDBDown)
assert.Nil(t, result)
assert.Error(t, err)             // System error present
assert.Nil(t, paramErrs)         // No param errors
```

## Running Tests

```bash
# All tests
go test ./test/...

# Specific package
go test ./test/grpc/...
go test ./test/service/...

# Verbose with single test
go test -v ./test/grpc/ -run TestOrderController_CreateOrder

# With build tags
go test -tags=grpc_legacy ./test/...
```

## Key Rules

1. **Layer Mocking:** Mock the layer BELOW what you're testing
   - Testing controller → Mock service
   - Testing service → Mock repository

2. **Triple Returns:** Always assert all three return values in service tests

3. **Mock Matching:** Use `mock.AnythingOfType("ParamTypeName")` for typed parameter matching

4. **Assertions:** Call `mock.AssertExpectations(t)` to verify all expected calls

5. **Table-Driven:** Required for every test function — not optional

6. **Coverage:** Test both success path AND error paths (validation + system errors)
