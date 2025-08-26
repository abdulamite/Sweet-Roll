import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

export interface EmailTemplateData {
  // Common variables available to all templates
  companyName?: string;
  supportEmail?: string;
  currentYear?: number;
  showHeader?: boolean;
  headerSubtitle?: string;
  unsubscribeUrl?: string;

  // Template-specific variables
  [key: string]: any;
}

export interface TemplateConfig {
  templateName: string;
  subject: string;
  data: EmailTemplateData;
  layout?: string | false; // Allow false to disable layout
}

export class EmailTemplateRenderer {
  private templatesPath: string;
  private layoutsPath: string;
  private partialsPath: string;
  private compiledTemplates: Map<string, HandlebarsTemplateDelegate> =
    new Map();
  private compiledLayouts: Map<string, HandlebarsTemplateDelegate> = new Map();
  private isInitialized: boolean = false;

  constructor() {
    this.templatesPath = path.join(
      __dirname,
      '../../email_templates/templates'
    );
    this.layoutsPath = path.join(__dirname, '../../email_templates/layouts');
    this.partialsPath = path.join(__dirname, '../../email_templates/partials');
  }

  /**
   * Initialize the template renderer by loading partials and compiling templates
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Register partials
      await this.registerPartials();

      // Register custom helpers
      this.registerHelpers();

      this.isInitialized = true;
      console.log('Email template renderer initialized successfully');
    } catch (error) {
      console.error('Failed to initialize email template renderer:', error);
      throw error;
    }
  }

  /**
   * Render an email template with the given data
   */
  async renderTemplate(config: TemplateConfig): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Get or compile the template
      const template = await this.getCompiledTemplate(config.templateName);

      // Add default data
      const templateData = this.addDefaultData(config.data, config.subject);

      // Render the template content
      const bodyContent = template(templateData);

      // If using a layout, render with layout
      if (config.layout !== false) {
        const layoutName = config.layout || 'base';
        const layout = await this.getCompiledLayout(layoutName);

        return layout({
          ...templateData,
          body: bodyContent,
          subject: config.subject,
        });
      }

      return bodyContent;
    } catch (error) {
      console.error(
        `Failed to render template "${config.templateName}":`,
        error
      );
      throw new Error(
        `Template rendering failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check if a template exists
   */
  templateExists(templateName: string): boolean {
    const templatePath = path.join(this.templatesPath, `${templateName}.hbs`);
    return fs.existsSync(templatePath);
  }

  /**
   * List all available templates
   */
  getAvailableTemplates(): string[] {
    try {
      return fs
        .readdirSync(this.templatesPath)
        .filter(file => file.endsWith('.hbs'))
        .map(file => file.replace('.hbs', ''));
    } catch (error) {
      console.error('Failed to list templates:', error);
      return [];
    }
  }

  /**
   * Get or compile a template
   */
  private async getCompiledTemplate(
    templateName: string
  ): Promise<HandlebarsTemplateDelegate> {
    if (this.compiledTemplates.has(templateName)) {
      return this.compiledTemplates.get(templateName)!;
    }

    const templatePath = path.join(this.templatesPath, `${templateName}.hbs`);

    if (!fs.existsSync(templatePath)) {
      throw new Error(
        `Template "${templateName}" not found at ${templatePath}`
      );
    }

    const templateContent = fs.readFileSync(templatePath, 'utf8');
    const compiledTemplate = Handlebars.compile(templateContent);

    this.compiledTemplates.set(templateName, compiledTemplate);
    return compiledTemplate;
  }

  /**
   * Get or compile a layout
   */
  private async getCompiledLayout(
    layoutName: string
  ): Promise<HandlebarsTemplateDelegate> {
    if (this.compiledLayouts.has(layoutName)) {
      return this.compiledLayouts.get(layoutName)!;
    }

    const layoutPath = path.join(this.layoutsPath, `${layoutName}.hbs`);

    if (!fs.existsSync(layoutPath)) {
      throw new Error(`Layout "${layoutName}" not found at ${layoutPath}`);
    }

    const layoutContent = fs.readFileSync(layoutPath, 'utf8');
    const compiledLayout = Handlebars.compile(layoutContent);

    this.compiledLayouts.set(layoutName, compiledLayout);
    return compiledLayout;
  }

  /**
   * Register all partials
   */
  private async registerPartials(): Promise<void> {
    if (!fs.existsSync(this.partialsPath)) {
      console.warn('Partials directory not found:', this.partialsPath);
      return;
    }

    const partialFiles = fs
      .readdirSync(this.partialsPath)
      .filter(file => file.endsWith('.hbs'));

    for (const file of partialFiles) {
      const partialName = file.replace('.hbs', '');
      const partialPath = path.join(this.partialsPath, file);
      const partialContent = fs.readFileSync(partialPath, 'utf8');

      Handlebars.registerPartial(partialName, partialContent);
      console.log(`Registered partial: ${partialName}`);
    }
  }

  /**
   * Register custom Handlebars helpers
   */
  private registerHelpers(): void {
    // Date formatting helper
    Handlebars.registerHelper(
      'formatDate',
      function (date: Date, format: string) {
        if (!date) return '';

        switch (format) {
          case 'short':
            return date.toLocaleDateString();
          case 'long':
            return date.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
          default:
            return date.toLocaleDateString();
        }
      }
    );

    // Uppercase helper
    Handlebars.registerHelper('uppercase', function (str: string) {
      return str ? str.toUpperCase() : '';
    });

    // Conditional helper for equality
    Handlebars.registerHelper('eq', function (a: any, b: any) {
      return a === b;
    });

    // Math helper for simple operations
    Handlebars.registerHelper('add', function (a: number, b: number) {
      return a + b;
    });
  }

  /**
   * Add default data that's available to all templates
   */
  private addDefaultData(
    data: EmailTemplateData,
    subject: string
  ): EmailTemplateData {
    return {
      companyName: 'Your Company Name',
      supportEmail: 'support@yourcompany.com',
      currentYear: new Date().getFullYear(),
      showHeader: true,
      ...data,
      subject,
    };
  }

  /**
   * Clear compiled template cache (useful for development)
   */
  clearCache(): void {
    this.compiledTemplates.clear();
    this.compiledLayouts.clear();
    console.log('Template cache cleared');
  }
}

export default EmailTemplateRenderer;
