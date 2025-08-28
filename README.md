# SEO Automation System

A comprehensive, beginner-friendly SEO automation tool that helps businesses and marketers create optimized content strategies, build SEO architectures, and generate content outlines.

## 🚀 Features

### Core Functionality
- **CSV Upload & Processing**: Drag-and-drop CSV upload with automatic parsing and validation
- **Data Preview**: Clean table view of uploaded data with search and filtering capabilities
- **SEO Architecture Builder**: Create SEO silos, hub & spoke, or pyramid structures
- **Content Generation**: Generate SEO-optimized content outlines and recommendations
- **Multi-format Export**: Download results in CSV, JSON, or Markdown formats

### User Experience
- **Step-by-step Workflow**: Intuitive 5-step process from upload to export
- **Beginner-Friendly**: Plain language labels and helpful tooltips
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Validation**: Immediate feedback on data quality and processing

## 🛠️ Technology Stack

- **Frontend**: React 18 with modern hooks
- **Styling**: TailwindCSS with custom component classes
- **Build Tool**: Vite for fast development and building
- **File Processing**: PapaParse for CSV parsing, React-Dropzone for file uploads
- **Icons**: Lucide React for consistent iconography

## 📋 Prerequisites

- Node.js 16+ 
- npm or yarn package manager

## 🚀 Quick Start

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd seo-automation-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── Header.jsx       # Application header
│   ├── StepIndicator.jsx # Step navigation
│   ├── UploadCSV.jsx    # CSV upload component
│   ├── DataPreview.jsx  # Data preview table
│   ├── SEOArchitectureBuilder.jsx # SEO structure builder
│   ├── ContentGenerator.jsx # Content generation
│   └── ExportResults.jsx # Results export
├── App.jsx              # Main application component
├── main.jsx            # Application entry point
└── index.css           # Global styles and TailwindCSS
```

## 📊 CSV Format Requirements

Your CSV file should include these columns:

| Column | Required | Description |
|--------|----------|-------------|
| `website_url` | ✅ | Your website's main URL |
| `primary_keywords` | ✅ | Main keywords separated by commas |
| `geographic_areas` | ✅ | Main service areas separated by commas |
| `secondary_keywords` | ❌ | Additional keywords (optional) |
| `secondary_areas` | ❌ | Additional geographic areas (optional) |
| `business_type` | ❌ | Type of business (optional) |
| `industry` | ❌ | Industry category (optional) |

### Sample CSV Data
```csv
website_url,primary_keywords,geographic_areas,business_type,industry
https://example.com,"web design,digital marketing","New York, NY",Digital Agency,Marketing
https://sample.com,"restaurant,fine dining","Chicago, IL",Restaurant,Food & Beverage
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎯 How It Works

### 1. Upload CSV
- Drag and drop your CSV file or use the file picker
- Automatic validation of required columns
- Preview of uploaded data

### 2. Data Preview
- Review your data in a clean, searchable table
- Select specific businesses for processing
- Navigate through paginated results

### 3. SEO Architecture
- Choose from three architecture types:
  - **Silo**: Topic clusters with strong internal linking
  - **Hub & Spoke**: Central hub with supporting content
  - **Pyramid**: Broad topics funnel to specific keywords
- Automatic generation of page hierarchies
- Internal linking recommendations

### 4. Content Generation
- Generate content outlines for main pages, service pages, and location pages
- SEO-optimized titles, meta descriptions, and headings
- Content recommendations and best practices

### 5. Export Results
- Download complete analysis in multiple formats
- Share results with your team
- Start new analysis or implement recommendations

## 🎨 Customization

### Styling
The application uses TailwindCSS with custom component classes. You can modify:
- Color scheme in `tailwind.config.js`
- Component styles in `src/index.css`
- Individual component styling

### Functionality
- Mock functions in components can be replaced with real AI/ML APIs
- CSV validation rules can be adjusted in `UploadCSV.jsx`
- Export formats can be extended in `ExportResults.jsx`

## 🔮 Future Enhancements

- **AI Integration**: Connect to Claude, ChatGPT, or other AI APIs
- **Advanced Analytics**: SEO performance tracking and reporting
- **Competitor Analysis**: Analyze competitor keywords and strategies
- **Content Templates**: Industry-specific content templates
- **API Endpoints**: RESTful API for programmatic access

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions or issues:
1. Check the documentation above
2. Review the code comments
3. Open an issue in the repository

## 🙏 Acknowledgments

- Built with React and TailwindCSS
- Icons provided by Lucide React
- CSV processing powered by PapaParse
- File uploads handled by React-Dropzone 