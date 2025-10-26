// Data Display Container Component

import React, { useCallback, useMemo } from 'react';
import { DataDisplayContainerProps } from '../types';
import { Card, GridBuilder, List as ListComponent } from '../../index';
import { cn } from '../../shared/utils';
import { DataDisplayEmptyState } from './DataDisplayEmptyState';
import { DataDisplayLoadingState } from './DataDisplayLoadingState';
import { DataDisplayErrorState } from './DataDisplayErrorState';

export const DataDisplayContainer: React.FC<DataDisplayContainerProps> = ({
  data,
  view,
  loading = false,
  error = null,
  onItemClick,
  onItemAction,
  config,
  state,
  className,
  ...props
}) => {
  const { layout = {} } = config;

  const handleItemClick = useCallback((item: any) => {
    onItemClick?.(item);
  }, [onItemClick]);

  const handleItemAction = useCallback((action: string, item: any) => {
    onItemAction?.(action, item);
  }, [onItemAction]);

  // Render different view types
  const renderView = () => {
    if (loading) {
      return <DataDisplayLoadingState config={config} />;
    }

    if (error) {
      return <DataDisplayErrorState error={error} />;
    }

    if (data.length === 0) {
      return <DataDisplayEmptyState config={config} />;
    }

    switch (view.component) {
      case 'card':
      case 'grid':
        return renderCardView();
      case 'list':
        return renderListView();
      case 'table':
        return renderTableView();
      case 'timeline':
        return renderTimelineView();
      default:
        return renderCardView();
    }
  };

  const renderCardView = () => {
    const gridConfig = {
      columns: view.config.columns || 3,
      gap: view.config.gap || 4,
      responsive: view.config.responsive !== false,
    };

    return (
      <GridBuilder config={gridConfig}>
        {data.map((item, index) => (
          <Card
            key={item.id || index}
            config={{
              ...view.config,
              title: item.name || item.title || 'Untitled',
              subtitle: item.description || item.subtitle,
              image: item.image ? {
                src: item.image,
                alt: item.name || item.title || 'Item',
                position: 'top' as const,
              } : undefined,
              actions: view.config.actions?.map(action => ({
                ...action,
                onClick: () => handleItemAction(action.id, item),
              })) || [],
            }}
            onClick={() => handleItemClick(item)}
            className="hover:shadow-lg transition-shadow duration-200"
          >
            {/* Custom card content */}
            {view.config.renderItem ? (
              view.config.renderItem(item, index)
            ) : (
              <div className="space-y-2">
                {Object.entries(item)
                  .filter(([key]) => !['id', 'name', 'title', 'description', 'image'].includes(key))
                  .slice(0, 5) // Limit to 5 fields
                  .map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="text-gray-900 font-medium">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </Card>
        ))}
      </GridBuilder>
    );
  };

  const renderListView = () => {
    const listConfig = {
      items: data.map((item, index) => ({
        id: item.id || index,
        title: item.name || item.title || 'Untitled',
        subtitle: item.description || item.subtitle,
        image: item.image,
        metadata: Object.entries(item)
          .filter(([key]) => !['id', 'name', 'title', 'description', 'image'].includes(key))
          .slice(0, 3)
          .map(([key, value]) => ({
            label: key.replace(/([A-Z])/g, ' $1').trim(),
            value: typeof value === 'object' ? JSON.stringify(value) : String(value),
          })),
        actions: view.config.actions?.map(action => ({
          ...action,
          onClick: () => handleItemAction(action.id, item),
        })) || [],
      })),
      onItemClick: handleItemClick,
    };

    return <ListComponent config={listConfig} />;
  };

  const renderTableView = () => {
    const columns = view.config.columns || Object.keys(data[0] || {}).slice(0, 5);
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column: string) => (
                <th
                  key={column}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.replace(/([A-Z])/g, ' $1').trim()}
                </th>
              ))}
              {view.config.actions && view.config.actions.length > 0 && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr
                key={item.id || index}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleItemClick(item)}
              >
                {columns.map((column: string) => (
                  <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {typeof item[column] === 'object' 
                      ? JSON.stringify(item[column])
                      : String(item[column] || '-')
                    }
                  </td>
                ))}
                {view.config.actions && view.config.actions.length > 0 && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {view.config.actions.map((action) => (
                        <button
                          key={action.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemAction(action.id, item);
                          }}
                          className={cn(
                            'text-blue-600 hover:text-blue-900',
                            action.variant === 'danger' && 'text-red-600 hover:text-red-900'
                          )}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderTimelineView = () => {
    return (
      <div className="space-y-4">
        {data.map((item, index) => (
          <div
            key={item.id || index}
            className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleItemClick(item)}
          >
            <div className="flex-shrink-0 w-3 h-3 bg-blue-600 rounded-full mt-2"></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {item.name || item.title || 'Untitled'}
                </h3>
                <span className="text-sm text-gray-500">
                  {item.date ? new Date(item.date).toLocaleDateString() : ''}
                </span>
              </div>
              {item.description && (
                <p className="mt-1 text-sm text-gray-600">{item.description}</p>
              )}
              {view.config.actions && view.config.actions.length > 0 && (
                <div className="mt-2 flex space-x-2">
                  {view.config.actions.map((action) => (
                    <button
                      key={action.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemAction(action.id, item);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-900"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const containerClasses = cn(
    'data-display-container',
    layout.content?.padding && `p-${layout.content.padding}`,
    layout.content?.gap && `gap-${layout.content.gap}`,
    className
  );

  return (
    <div className={containerClasses} {...props}>
      {renderView()}
    </div>
  );
};

DataDisplayContainer.displayName = 'DataDisplayContainer';
