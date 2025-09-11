# TableAction Component

A reusable component for rendering action buttons in table rows with dynamic configuration for view, edit, delete, and custom actions.

## Features

- **Dynamic Actions**: Configure view, edit, delete, and custom children buttons
- **Individual Props**: Each action button can have its own onClick, disabled, loading, variant, size, and styling
- **Flexible Styling**: Customizable spacing, className, and button variants
- **Loading States**: Built-in loading indicators for each button
- **Tooltips**: Support for tooltips on each action button
- **TypeScript Support**: Full type safety with proper interfaces

## Usage

### Basic Usage

```tsx
import { TableAction } from "@/core/components/ui/table-action";

// In your table column definition
{
  header: "Action",
  accessorKey: "actions",
  enableSorting: false,
  enableHiding: false,
  cell: ({ row }) => (
    <TableAction
      view={{
        onClick: () => handleView(row.original.id),
        tooltip: "View details",
      }}
      edit={{
        onClick: () => handleEdit(row.original.id),
        tooltip: "Edit item",
      }}
      delete={{
        onClick: () => handleDelete(row.original.id),
        tooltip: "Delete item",
      }}
    />
  ),
}
```

### Advanced Usage with Custom Actions

```tsx
<TableAction
  view={{
    onClick: () => handleView(row.original.id),
    disabled: !row.original.isActive,
    tooltip: "View details",
  }}
  edit={{
    onClick: () => handleEdit(row.original.id),
    loading: isEditing,
    variant: "outlined",
    tooltip: "Edit item",
  }}
  delete={{
    onClick: () => handleDelete(row.original.id),
    disabled: row.original.isProtected,
    variant: "ghost",
    tooltip: "Delete item",
  }}
  spacing="lg"
  className="my-custom-class"
>
  <Button
    variant="text"
    size="sm"
    onClick={() => handleCustomAction(row.original.id)}
  >
    Custom Action
  </Button>
</TableAction>
```

### Conditional Actions

```tsx
<TableAction
  view={{
    onClick: () => handleView(row.original.id),
  }}
  edit={
    row.original.canEdit
      ? {
          onClick: () => handleEdit(row.original.id),
        }
      : undefined
  }
  delete={
    row.original.canDelete
      ? {
          onClick: () => handleDelete(row.original.id),
        }
      : undefined
  }
/>
```

## Props

### TableActionProps

| Prop        | Type                             | Default     | Description                              |
| ----------- | -------------------------------- | ----------- | ---------------------------------------- |
| `view`      | `ActionButtonProps \| undefined` | `undefined` | View action button configuration         |
| `edit`      | `ActionButtonProps \| undefined` | `undefined` | Edit action button configuration         |
| `delete`    | `ActionButtonProps \| undefined` | `undefined` | Delete action button configuration       |
| `children`  | `ReactNode`                      | `undefined` | Custom action buttons or content         |
| `className` | `string`                         | `undefined` | Additional CSS classes for the container |
| `spacing`   | `"sm" \| "md" \| "lg"`           | `"md"`      | Spacing between action buttons           |

### ActionButtonProps

| Prop        | Type                                                       | Default     | Description                            |
| ----------- | ---------------------------------------------------------- | ----------- | -------------------------------------- |
| `onClick`   | `() => void`                                               | `undefined` | Click handler for the button           |
| `disabled`  | `boolean`                                                  | `false`     | Whether the button is disabled         |
| `loading`   | `boolean`                                                  | `false`     | Whether the button is in loading state |
| `variant`   | `"contained" \| "outlined" \| "ghost" \| "text" \| "link"` | `"ghost"`   | Button variant                         |
| `size`      | `"tiny" \| "sm" \| "md" \| "lg" \| "icon"`                 | `"icon"`    | Button size                            |
| `className` | `string`                                                   | `undefined` | Additional CSS classes for the button  |
| `icon`      | `ReactNode`                                                | `undefined` | Custom icon (overrides default)        |
| `tooltip`   | `string`                                                   | `undefined` | Tooltip text for the button            |

## Default Icons

- **View**: Eye icon (`EyeIcon`)
- **Edit**: Pencil icon (`PencilIcon`)
- **Delete**: Trash icon (`TrashIcon`)

## Examples

### Different Button Variants

```tsx
<TableAction
  view={{ variant: "contained", onClick: handleView }}
  edit={{ variant: "outlined", onClick: handleEdit }}
  delete={{ variant: "ghost", onClick: handleDelete }}
/>
```

### Loading States

```tsx
<TableAction
  edit={{
    onClick: handleEdit,
    loading: isEditing,
  }}
  delete={{
    onClick: handleDelete,
    loading: isDeleting,
  }}
/>
```

### Custom Icons

```tsx
<TableAction
  view={{
    onClick: handleView,
    icon: <CustomViewIcon className="h-4 w-4" />,
  }}
  edit={{
    onClick: handleEdit,
    icon: <CustomEditIcon className="h-4 w-4" />,
  }}
/>
```
