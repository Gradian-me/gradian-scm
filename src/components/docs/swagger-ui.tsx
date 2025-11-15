'use client';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

type SwaggerUIRendererProps = {
  url: string;
};

export default function SwaggerUIRenderer({ url }: SwaggerUIRendererProps) {
  return (
    <div className="rounded-lg border bg-background shadow-sm">
      <SwaggerUI
        url={url}
        docExpansion="list"
        defaultModelRendering="schema"
        defaultModelsExpandDepth={1}
        persistAuthorization
        showExtensions
      />
    </div>
  );
}


