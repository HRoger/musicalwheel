# Task 3 Step 3 Phase 3.2: Modifiers System Implementation

**Date:** November 9, 2025  
**Status:** ⏳ Ready to Start  
**Prerequisites:** Phase 3.1 (Parser & Renderer) Complete ✅

**Estimated Duration:** 24-32 hours (AI work) | 45-60 minutes (your supervision)

---

## Context

### Completed:

✅ **Phase 3.1: Core parser and renderer working**
- ✅ VoxelScript tokenizer handles `@tags()` syntax
- ✅ Post and Site data groups implemented with WordPress functions
- ✅ Basic expressions tested: `@post(title)`, `@site(title)`
- ✅ Unit tests passing (5 tests, 9 assertions)
- ✅ PHPUnit setup with WordPress mocks

### Current State:

- ✅ Parser already tokenizes modifiers (dot syntax `.modifier()` detected)
- ✅ Modifier tokens extracted but not yet processed
- ✅ Renderer coordinates data groups but doesn't apply modifiers
- ✅ `Dynamic_Tag::render()` has placeholder for modifier application

### What's Next:

Phase 3.2 implements the complete modifiers system to transform tag output values.

---

## Goal

Implement Voxel's complete modifiers system (29 modifiers) to enable data transformation in dynamic expressions.

### Example Target Functionality:

- `@post(title).truncate(50)` - Truncate title to 50 characters
- `@post(date).date_format(Y-m-d)` - Format date
- `@post(price).number_format(2).currency_format(USD)` - Chain modifiers
- `@post(title).is_empty.then(No Title).else(@post(title))` - Conditional logic

**⚠️ CRITICAL: Voxel uses DOT syntax (`.modifier()`) NOT pipe syntax (`|modifier()`)**

---

## Phase 3.2 Objectives

### 1. Study Voxel's Modifiers Implementation

**Discover:**

1. **Modifier Registration System:**
   - Find `voxel/app/dynamic-data/config.php` → `Config::get_modifiers()`
   - Study how modifiers are registered (array of class names)
   - Document all 29 modifiers with their class names

2. **Base Modifier Architecture:**
   - Study `voxel/app/dynamic-data/modifiers/base-modifier.php`
   - Understand `Base_Modifier` abstract class
   - Study `apply()` method signature
   - Understand `get_arg()` method (handles dynamic arguments)
   - Study `expects()` method (type expectations)
   - Study `define_args()` method (parameter definitions)

3. **Modifier Retrieval System:**
   - Study `Base_Data_Group::get_modifier()` method
   - Understand two-tier system:
     1. Group-specific methods (via `methods()` array)
     2. Common modifiers (via `Config::get_modifiers()`)
   - Document how modifiers are instantiated (new instance per use)

4. **Control Structures:**
   - Study `voxel/app/dynamic-data/modifiers/control-structures/base-control-structure.php`
   - Understand `passes()` method (conditional logic)
   - Study `is_empty`, `then`, `else` implementations
   - Understand how `$last_condition` affects chaining
   - Document control structure flow logic

5. **Modifier Application Logic:**
   - Study `Dynamic_Tag::render()` method (lines 39-57)
   - Understand modifier chaining loop
   - Understand how `$last_condition` controls flow
   - Study how control structures skip modifiers
   - Understand dynamic argument resolution (nested tags)

6. **Parameter Parsing:**
   - Study how modifier arguments are parsed (already done in tokenizer)
   - Understand `$modifier_data['args']` structure
   - Study dynamic argument handling (`arg['dynamic']` flag)
   - Understand how nested tags in arguments are resolved

**Questions to Answer:**

- How does Voxel register modifiers? (`Config::get_modifiers()`)
- What's the base modifier class/interface? (`Base_Modifier`)
- How are modifier parameters validated? (`define_args()`, `get_arg()`)
- How does chaining work? (left-to-right, condition-based skipping)
- What happens when a modifier fails? (returns value as-is, no exceptions)
- How are control flow modifiers (is_empty, then, else) implemented? (`passes()` method)
- How are dynamic arguments handled? (nested tags in modifier params)
- How are modifiers retrieved from data groups? (`Base_Data_Group::get_modifier()`)

### 2. Create Modifier System Architecture

**Design Based on Voxel's Patterns:**

1. **Modifier Registry:**
   - Create `app/dynamic-data/config.php` (or similar)
   - Implement `Config::get_modifiers()` method
   - Register all 29 modifiers as class names

2. **Base Modifier Class:**
   - Create `app/dynamic-data/modifiers/Base_Modifier.php`
   - Abstract class with `apply()` method
   - Implement `get_arg()` with dynamic argument support
   - Implement `set_renderer()`, `set_tag()`, `set_args()`
   - Implement `expects()`, `get_type()`, `define_args()`

3. **Control Structure Base:**
   - Create `app/dynamic-data/modifiers/control-structures/Base_Control_Structure.php`
   - Extends `Base_Modifier`
   - Implements `passes()` method
   - Overrides `get_type()` to return `'control-structure'`

4. **Data Group Integration:**
   - Update `Base_Data_Group::get_modifier()` method
   - Check group-specific methods first
   - Fall back to common modifiers
   - Return new modifier instance

5. **Renderer Integration:**
   - Update `Dynamic_Tag::render()` method
   - Implement modifier application loop
   - Handle control structure logic (`$last_condition`)
   - Apply modifiers in sequence (left-to-right)
   - Handle dynamic arguments

**Note: Let Voxel's architecture guide your design decisions. Match their patterns exactly.**

### 3. Implement All 29 Modifiers

**Modifier Categories to Implement:**

#### Text Modifiers (11 modifiers):
- `truncate` - Limit text length
- `append` - Add text after value
- `prepend` - Add text before value
- `capitalize` - Capitalize text
- `abbreviate` - Shorten text with ellipsis
- `replace` - Find and replace text
- `list` - Format array as list
- `first` - Get first item from array
- `last` - Get last item from array
- `nth` - Get nth item from array
- `count` - Count array items

#### Number Modifiers (3 modifiers):
- `number_format` - Format numbers (decimals, thousands separator)
- `currency_format` - Format as currency
- `round` - Round numbers

#### Date Modifiers (3 modifiers):
- `date_format` - Format dates
- `time_diff` - Show time difference (e.g., "2 hours ago")
- `to_age` - Convert birthdate to age

#### Control Structures (13 modifiers):
- `is_empty` - Check if empty
- `is_not_empty` - Check if not empty
- `is_equal_to` - Compare equality
- `is_not_equal_to` - Compare inequality
- `is_greater_than` - Numeric comparison
- `is_less_than` - Numeric comparison
- `is_between` - Range check
- `is_checked` - Boolean check
- `is_unchecked` - Boolean check
- `then` - Execute if condition passed
- `else` - Execute if condition failed
- `and` - Logical AND
- `or` - Logical OR

**Note: Control structures use `passes()` method to determine flow. Study Voxel's implementation carefully.**

### 4. Update Dynamic_Tag to Apply Modifiers

**Current State:**
- `Dynamic_Tag::render()` resolves property but doesn't apply modifiers
- Modifiers are parsed by tokenizer but stored unused

**Required Changes:**

1. **Modifier Application Loop:**
   - Iterate through `$this->modifiers` array
   - Get modifier instance from data group
   - Apply modifier to current value
   - Handle control structure flow (`$last_condition`)
   - Update value for next modifier

2. **Control Structure Logic:**
   - Track `$last_condition` state
   - Skip modifiers when condition failed and `then` not yet executed
   - Skip modifiers when condition passed and `then` executed
   - Handle `else` modifier appropriately

3. **Dynamic Argument Resolution:**
   - Check if argument has `['dynamic'] => true` flag
   - Render nested tags in arguments
   - Pass resolved arguments to modifier

4. **Error Handling:**
   - If modifier not found, skip it (don't break chain)
   - If modifier fails, return value as-is (no exceptions)
   - Log errors for debugging (WP_DEBUG mode)

### 5. Create Comprehensive Test Suite

**Test Categories:**

1. **Text Modifier Tests:**
   - `truncate` with various lengths
   - `append` and `prepend` with dynamic arguments
   - `capitalize`, `abbreviate` edge cases
   - `replace` with special characters
   - `list`, `first`, `last`, `nth` with arrays

2. **Number Modifier Tests:**
   - `number_format` with decimals and separators
   - `currency_format` with various currencies
   - `round` with precision

3. **Date Modifier Tests:**
   - `date_format` with various formats
   - `time_diff` with past/future dates
   - `to_age` with birthdates

4. **Control Structure Tests:**
   - `is_empty` / `is_not_empty` conditions
   - `then` / `else` flow logic
   - Chained conditions (`is_empty.then(...).else(...)`)
   - Nested conditions

5. **Modifier Chaining Tests:**
   - Multiple text modifiers
   - Mixed modifier types
   - Control structures in chains
   - Dynamic arguments in chains

6. **Edge Case Tests:**
   - Empty values
   - Null values
   - Invalid modifier names
   - Missing modifier arguments
   - Nested tags in arguments

**Test File:**
- `tests/unit/ModifiersTest.php`
- Use PHPUnit with WordPress mocks
- Test all 29 modifiers
- Test modifier chaining
- Test control structures

---

## Success Criteria

### Must Have (Phase 3.2 Complete):

1. ✅ All 29 modifiers implemented and tested
2. ✅ Modifier chaining works (left-to-right)
3. ✅ Control structures work (`is_empty.then(...).else(...)`)
4. ✅ Dynamic arguments work (nested tags in modifier params)
5. ✅ Error handling works (graceful failures, no exceptions)
6. ✅ Unit tests pass (all modifiers tested)
7. ✅ Matches Voxel's modifier behavior
8. ✅ Documentation updated

### Should Have:

- Performance optimization (modifier caching if needed)
- Modifier argument validation
- Type coercion (string, number, date)

### Nice to Have:

- Modifier aliases (e.g., `trunc` for `truncate`)
- Custom modifier registration API
- Modifier documentation generator

---

## Implementation Steps

### Step 1: Discovery (2-3 hours)

1. Study Voxel's modifier system architecture
2. Document all 29 modifiers with their implementations
3. Document modifier registration system
4. Document control structure flow logic
5. Document dynamic argument handling

**Deliverables:**
- `docs/voxel-discovery/dynamic-system/MODIFIERS_DISCOVERY.md`
- List of all 29 modifiers with class names
- Architecture diagram of modifier system

### Step 2: Base Architecture (4-6 hours)

1. Create `Config::get_modifiers()` method
2. Create `Base_Modifier` abstract class
3. Create `Base_Control_Structure` abstract class
4. Update `Base_Data_Group::get_modifier()` method
5. Create modifier directory structure

**Deliverables:**
- `app/dynamic-data/config.php`
- `app/dynamic-data/modifiers/Base_Modifier.php`
- `app/dynamic-data/modifiers/control-structures/Base_Control_Structure.php`
- Updated `Base_Data_Group.php`

### Step 3: Implement Text Modifiers (4-6 hours)

1. Implement 11 text modifiers
2. Test each modifier individually
3. Test modifier chaining
4. Test dynamic arguments

**Deliverables:**
- `app/dynamic-data/modifiers/Text_Modifiers/` (11 files)
- Unit tests for text modifiers

### Step 4: Implement Number Modifiers (2-3 hours)

1. Implement 3 number modifiers
2. Test each modifier individually
3. Test modifier chaining
4. Test edge cases (negative numbers, decimals)

**Deliverables:**
- `app/dynamic-data/modifiers/Number_Modifiers/` (3 files)
- Unit tests for number modifiers

### Step 5: Implement Date Modifiers (3-4 hours)

1. Implement 3 date modifiers
2. Test each modifier individually
3. Test modifier chaining
4. Test timezone handling

**Deliverables:**
- `app/dynamic-data/modifiers/Date_Modifiers/` (3 files)
- Unit tests for date modifiers

### Step 6: Implement Control Structures (6-8 hours)

1. Implement 13 control structure modifiers
2. Test conditional logic
3. Test `then` / `else` flow
4. Test nested conditions
5. Test `$last_condition` tracking

**Deliverables:**
- `app/dynamic-data/modifiers/control-structures/` (13 files)
- Unit tests for control structures

### Step 7: Update Dynamic_Tag (3-4 hours)

1. Implement modifier application loop
2. Implement control structure logic
3. Implement dynamic argument resolution
4. Implement error handling
5. Test modifier chaining

**Deliverables:**
- Updated `Dynamic_Tag.php`
- Integration tests

### Step 8: Comprehensive Testing (2-3 hours)

1. Write unit tests for all modifiers
2. Write integration tests for modifier chaining
3. Write edge case tests
4. Fix any bugs found

**Deliverables:**
- `tests/unit/ModifiersTest.php`
- All tests passing

### Step 9: Documentation (1-2 hours)

1. Update `phase-3.2-modifiers.md` with implementation details
2. Update `CRITICAL_PIVOT.md` with Phase 3.2 completion
3. Create modifier reference documentation
4. Update `SESSION_SUMMARY.md`

**Deliverables:**
- Updated documentation files
- Modifier reference guide

---

## File Structure

### New Files to Create:

```
app/dynamic-data/
├── config.php                                    # Modifier registry
├── modifiers/
│   ├── Base_Modifier.php                        # Abstract base class
│   ├── Text_Modifiers/
│   │   ├── Truncate.php
│   │   ├── Append.php
│   │   ├── Prepend.php
│   │   ├── Capitalize.php
│   │   ├── Abbreviate.php
│   │   ├── Replace.php
│   │   ├── List.php
│   │   ├── First.php
│   │   ├── Last.php
│   │   ├── Nth.php
│   │   └── Count.php
│   ├── Number_Modifiers/
│   │   ├── Number_Format.php
│   │   ├── Currency_Format.php
│   │   └── Round.php
│   ├── Date_Modifiers/
│   │   ├── Date_Format.php
│   │   ├── Time_Diff.php
│   │   └── To_Age.php
│   └── control-structures/
│       ├── Base_Control_Structure.php
│       ├── Is_Empty.php
│       ├── Is_Not_Empty.php
│       ├── Is_Equal_To.php
│       ├── Is_Not_Equal_To.php
│       ├── Is_Greater_Than.php
│       ├── Is_Less_Than.php
│       ├── Is_Between.php
│       ├── Is_Checked.php
│       ├── Is_Unchecked.php
│       ├── Then.php
│       ├── Else.php
│       ├── And.php
│       └── Or.php
```

### Files to Update:

```
app/dynamic-data/
├── data-groups/
│   └── Base_Data_Group.php                      # Add get_modifier() method
├── parser/
│   └── Tokens/
│       └── Dynamic_Tag.php                      # Implement modifier application
└── loader.php                                   # Register config.php
```

### Test Files:

```
tests/unit/
└── ModifiersTest.php                            # Comprehensive modifier tests
```

---

## Reference Files (Voxel)

### Core Modifier System:

- `voxel/app/dynamic-data/config.php` - Modifier registry
- `voxel/app/dynamic-data/modifiers/base-modifier.php` - Base modifier class
- `voxel/app/dynamic-data/modifiers/control-structures/base-control-structure.php` - Control structure base
- `voxel/app/dynamic-data/data-groups/base-data-group.php` - `get_modifier()` method

### Example Modifiers (Study These):

- `voxel/app/dynamic-data/modifiers/text/truncate.php`
- `voxel/app/dynamic-data/modifiers/text/append.php`
- `voxel/app/dynamic-data/modifiers/number/number-format.php`
- `voxel/app/dynamic-data/modifiers/date/date-format.php`
- `voxel/app/dynamic-data/modifiers/control-structures/is-empty.php`
- `voxel/app/dynamic-data/modifiers/control-structures/then.php`
- `voxel/app/dynamic-data/modifiers/control-structures/else.php`

### Modifier Application:

- `voxel/app/dynamic-data/voxelscript/tokens/dynamic-tag.php` - Lines 39-57 (modifier application loop)

---

## Critical Requirements

### 1. Match Voxel's Architecture

- Use same class structure
- Use same method names
- Use same parameter handling
- Use same error handling
- Use same control structure logic

### 2. Dot Syntax (Not Pipe)

- ✅ Correct: `@post(title).truncate(50)`
- ❌ Wrong: `@post(title)|truncate(50)`

### 3. Modifier Chaining

- Apply modifiers left-to-right
- Each modifier receives output of previous modifier
- Control structures affect flow (skip modifiers based on condition)

### 4. Dynamic Arguments

- Support nested tags in modifier arguments
- Render nested tags before passing to modifier
- Handle recursive rendering

### 5. Error Handling

- Graceful failures (no exceptions)
- Return value as-is if modifier fails
- Log errors for debugging (WP_DEBUG mode)
- Skip unknown modifiers (don't break chain)

### 6. Control Structures

- Track `$last_condition` state
- `then` executes if last condition passed
- `else` executes if last condition failed
- Skip modifiers when condition failed and `then` not executed
- Skip modifiers when condition passed and `then` executed

### 7. Testing

- Unit tests for all modifiers
- Integration tests for modifier chaining
- Edge case tests
- All tests must pass

---

## Known Challenges

### 1. Control Structure Flow Logic

**Challenge:** Understanding how `$last_condition` affects modifier chaining.

**Solution:** Study Voxel's `Dynamic_Tag::render()` method carefully. Track condition state through the chain.

### 2. Dynamic Arguments

**Challenge:** Rendering nested tags within modifier arguments.

**Solution:** Use renderer to render nested tags before passing to modifier. Handle recursive rendering.

### 3. Modifier Registration

**Challenge:** Registering 29 modifiers without hardcoding.

**Solution:** Use `Config::get_modifiers()` array. Auto-load modifier classes.

### 4. Type Coercion

**Challenge:** Handling different data types (string, number, date, array).

**Solution:** Use `expects()` method to validate types. Coerce types when needed.

### 5. Performance

**Challenge:** Modifier chaining might be slow for long chains.

**Solution:** Profile performance. Cache modifier instances if needed. Optimize control structure logic.

---

## Testing Strategy

### Unit Tests:

1. **Individual Modifier Tests:**
   - Test each modifier with various inputs
   - Test edge cases (empty, null, invalid)
   - Test parameter validation

2. **Modifier Chaining Tests:**
   - Test multiple modifiers in chain
   - Test control structures in chain
   - Test dynamic arguments in chain

3. **Control Structure Tests:**
   - Test conditional logic
   - Test `then` / `else` flow
   - Test nested conditions

### Integration Tests:

1. **End-to-End Tests:**
   - Test complete expressions with modifiers
   - Test modifier chaining with data groups
   - Test dynamic arguments with nested tags

### Edge Case Tests:

1. **Error Handling:**
   - Test unknown modifiers
   - Test missing arguments
   - Test invalid arguments
   - Test null/empty values

2. **Performance Tests:**
   - Test long modifier chains
   - Test nested control structures
   - Test recursive dynamic arguments

---

## Documentation Requirements

### Implementation Documentation:

1. **Modifier Architecture:**
   - Base modifier class structure
   - Control structure flow logic
   - Dynamic argument handling
   - Error handling

2. **Modifier Reference:**
   - List of all 29 modifiers
   - Parameter descriptions
   - Usage examples
   - Return types

3. **Testing Documentation:**
   - Test coverage report
   - Test results
   - Known issues

### User Documentation (Future):

1. **Modifier Guide:**
   - How to use modifiers
   - Modifier examples
   - Modifier chaining examples
   - Control structure examples

---

## Next Steps After Phase 3.2

### Phase 3.3: Additional Data Groups (8-12 hours)

- Implement User data group
- Implement Term data group
- Implement Query data group
- Implement remaining data groups (15 total)

### Phase 3.4: React Editor UI (16-20 hours)

- Create React component for tag selection
- Create modifier selection UI
- Create real-time preview
- Integrate with block editor

### Phase 3.5: Block Integration (8-12 hours)

- Integrate dynamic tags into blocks
- Add dynamic tag controls to block settings
- Test with real blocks

---

## Success Metrics

### Phase 3.2 Complete When:

1. ✅ All 29 modifiers implemented
2. ✅ All modifiers tested (unit tests passing)
3. ✅ Modifier chaining works
4. ✅ Control structures work
5. ✅ Dynamic arguments work
6. ✅ Error handling works
7. ✅ Documentation updated
8. ✅ Matches Voxel's behavior

### Performance Targets:

- Modifier application: < 1ms per modifier
- Modifier chaining: < 10ms for 10 modifiers
- Control structures: < 2ms per condition

### Quality Targets:

- Test coverage: > 90%
- No known bugs
- All edge cases handled
- Documentation complete

---

## Important Notes

### 1. Discovery-First Approach

- **Always study Voxel's implementation first**
- **Match Voxel's architecture exactly**
- **Don't assume - discover**

### 2. Test-Driven Development

- Write tests before implementing modifiers
- Test edge cases
- Test modifier chaining
- Test control structures

### 3. Error Handling

- Graceful failures (no exceptions)
- Return value as-is if modifier fails
- Log errors for debugging
- Skip unknown modifiers

### 4. Performance

- Profile performance
- Cache modifier instances if needed
- Optimize control structure logic
- Minimize recursive rendering

### 5. Documentation

- Document all modifiers
- Document modifier chaining
- Document control structures
- Document edge cases

---

## Getting Started

### Step 1: Study Voxel's Modifier System

```bash
# Analyze Voxel's modifier architecture
# Study base-modifier.php
# Study control-structure base
# Study modifier registration
# Study modifier application logic
```

### Step 2: Create Base Architecture

```bash
# Create Config::get_modifiers()
# Create Base_Modifier class
# Create Base_Control_Structure class
# Update Base_Data_Group::get_modifier()
```

### Step 3: Implement Modifiers

```bash
# Start with text modifiers (easiest)
# Then number modifiers
# Then date modifiers
# Finally control structures (most complex)
```

### Step 4: Test Thoroughly

```bash
# Write unit tests
# Write integration tests
# Test edge cases
# Fix any bugs
```

### Step 5: Document

```bash
# Update phase-3.2-modifiers.md
# Update CRITICAL_PIVOT.md
# Create modifier reference
# Update SESSION_SUMMARY.md
```

---

## Questions to Answer During Implementation

1. How does Voxel register modifiers?
2. How does Voxel instantiate modifiers?
3. How does Voxel handle modifier arguments?
4. How does Voxel handle dynamic arguments?
5. How does Voxel handle control structures?
6. How does Voxel handle modifier chaining?
7. How does Voxel handle errors?
8. How does Voxel handle type coercion?

---

## Resources

### Voxel Files to Study:

- `voxel/app/dynamic-data/config.php`
- `voxel/app/dynamic-data/modifiers/base-modifier.php`
- `voxel/app/dynamic-data/modifiers/control-structures/base-control-structure.php`
- `voxel/app/dynamic-data/data-groups/base-data-group.php`
- `voxel/app/dynamic-data/voxelscript/tokens/dynamic-tag.php`

### Documentation:

- `docs/voxel-discovery/dynamic-system/CRITICAL_DISCOVERY.md`
- `docs/voxel-discovery/dynamic-system/IMPLEMENTATION_ROADMAP.md`
- `docs/project-log/2025-11-09_task-3.1/phase-3.1-parser.md`

### Test Files:

- `tests/unit/DynamicContentParserTest.php` (reference for test structure)

---

## Conclusion

Phase 3.2 implements the complete modifiers system, enabling powerful data transformation in dynamic expressions. This is a critical step toward matching Voxel's dynamic content capabilities.

**Remember:** Study Voxel's implementation first. Match their architecture exactly. Test thoroughly. Document everything.

**Estimated Time:** 24-32 hours (AI work) | 45-60 minutes (your supervision)

**Priority:** HIGH - Required for dynamic content system

---

**Generated:** November 9, 2025  
**Version:** 1.0  
**Status:** ⏳ Ready to Start  
**Next Phase:** Phase 3.3 (Additional Data Groups)

