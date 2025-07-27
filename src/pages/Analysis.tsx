import React, { useState, useCallback } from 'react';
import {
  PhotoIcon,
  DocumentIcon,
  PhoneIcon,
  ChartBarIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline';
import FileUpload from '../components/Common/FileUpload';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ProgressBar from '../components/Common/ProgressBar';

interface AnalysisModule {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  acceptedTypes: string[];
  maxSize: number;
  features: string[];
}

const analysisModules: AnalysisModule[] = [
  {
    id: 'vision',
    title: 'การวิเคราะห์ภาพและวิดีโอ',
    description: 'วิเคราะห์ CCTV, รูปภาพ, วิดีโอ เพื่อตรวจจับวัตถุ, ใบหน้า, ป้ายทะเบียน',
    icon: PhotoIcon,
    acceptedTypes: ['image/*', 'video/*'],
    maxSize: 100 * 1024 * 1024, // 100MB
    features: [
      'ตรวจจับวัตถุและบุคคล',
      'จดจำใบหน้า',
      'อ่านป้ายทะเบียนรถ',
      'วิเคราะห์อารมณ์',
      'ติดตามการเคลื่อนไหว',
    ],
  },
  {
    id: 'document',
    title: 'การวิเคราะห์เอกสาร',
    description: 'วิเคราะห์เอกสาร, สื่อสังคมออนไลน์ เพื่อสกัดข้อมูลสำคัญ',
    icon: DocumentIcon,
    acceptedTypes: ['.pdf', '.doc', '.docx', '.txt'],
    maxSize: 50 * 1024 * 1024, // 50MB
    features: [
      'สกัดชื่อ, สถานที่, วันที่',
      'วิเคราะห์ความรู้สึก',
      'หาคำสำคัญ',
      'สร้าง Knowledge Graph',
      'เชื่อมโยงข้อมูล',
    ],
  },
  {
    id: 'cdr',
    title: 'การวิเคราะห์ CDR/การเงิน',
    description: 'วิเคราะห์บันทึกการโทร, ข้อมูลการเงิน เพื่อสร้างเครือข่ายความสัมพันธ์',
    icon: PhoneIcon,
    acceptedTypes: ['.csv', '.xlsx', '.xls'],
    maxSize: 20 * 1024 * 1024, // 20MB
    features: [
      'สร้างแผนภาพเครือข่าย',
      'วิเคราะห์รูปแบบการติดต่อ',
      'ติดตามการเคลื่อนไหว',
      'หาจุดผิดปกติ',
      'Timeline Analysis',
    ],
  },
];

const Analysis: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<string>('vision');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const currentModule = analysisModules.find(m => m.id === selectedModule);

  const handleFilesSelected = useCallback((files: File[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
    
    // Simulate upload progress
    files.forEach(file => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
        }
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: progress,
        }));
      }, 200);
    });
  }, []);

  const handleRemoveFile = useCallback((fileName: string) => {
    setUploadedFiles(prev => prev.filter(f => f.name !== fileName));
    setUploadProgress(prev => {
      const updated = { ...prev };
      delete updated[fileName];
      return updated;
    });
  }, []);

  const handleStartAnalysis = async () => {
    if (uploadedFiles.length === 0) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisResults(null);

    // Simulate analysis progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 500);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Mock results based on module type
      let mockResults;
      switch (selectedModule) {
        case 'vision':
          mockResults = {
            objects: [
              { name: 'บุคคล', confidence: 0.95, count: 3 },
              { name: 'รถยนต์', confidence: 0.89, count: 2 },
              { name: 'ป้ายทะเบียน', confidence: 0.87, count: 1, text: 'กข 1234' },
            ],
            faces: [
              { id: 1, confidence: 0.92, age: 35, gender: 'ชาย' },
              { id: 2, confidence: 0.88, age: 28, gender: 'หญิง' },
            ],
            summary: 'พบบุคคล 3 คน รถยนต์ 2 คัน และป้ายทะเบียน กข 1234',
          };
          break;
        case 'document':
          mockResults = {
            entities: [
              { text: 'นาย สมชาย ใจดี', type: 'PERSON', confidence: 0.95 },
              { text: 'บริษัท ABC จำกัด', type: 'ORGANIZATION', confidence: 0.91 },
              { text: 'กรุงเทพมหานคร', type: 'LOCATION', confidence: 0.89 },
              { text: '15 มกราคม 2024', type: 'DATE', confidence: 0.93 },
            ],
            sentiment: { score: 0.2, label: 'เป็นกลาง' },
            keywords: ['สัญญา', 'การเงิน', 'ธุรกิจ', 'ลงทุน'],
            summary: 'เอกสารเกี่ยวกับสัญญาทางธุรกิจระหว่างบุคคลและองค์กร',
          };
          break;
        case 'cdr':
          mockResults = {
            totalRecords: 1247,
            uniqueNumbers: 23,
            timeRange: '1 ม.ค. 2024 - 31 ม.ค. 2024',
            topContacts: [
              { number: '081-234-5678', calls: 45, duration: 1234 },
              { number: '089-876-5432', calls: 32, duration: 987 },
              { number: '062-111-2222', calls: 28, duration: 756 },
            ],
            patterns: [
              'การโทรส่วนใหญ่เกิดขึ้นในช่วง 18:00-22:00',
              'มีการติดต่อกับหมายเลขต้องสงสัย 3 หมายเลข',
              'พบรูปแบบการโทรที่ผิดปกติในวันที่ 15 ม.ค.',
            ],
          };
          break;
        default:
          mockResults = {};
      }

      setAnalysisResults(mockResults);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
      clearInterval(progressInterval);
      setAnalysisProgress(100);
    }
  };

  const renderResults = () => {
    if (!analysisResults) return null;

    switch (selectedModule) {
      case 'vision':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">สรุปผลการวิเคราะห์</h4>
              <p className="text-blue-800">{analysisResults.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <h4 className="font-medium text-gray-900 mb-3">วัตถุที่ตรวจพบ</h4>
                <div className="space-y-2">
                  {analysisResults.objects.map((obj: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="font-medium">{obj.name}</span>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">จำนวน: {obj.count}</div>
                        <div className="text-xs text-gray-500">ความแม่นยำ: {(obj.confidence * 100).toFixed(1)}%</div>
                        {obj.text && <div className="text-xs text-blue-600">{obj.text}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h4 className="font-medium text-gray-900 mb-3">ใบหน้าที่ตรวจพบ</h4>
                <div className="space-y-2">
                  {analysisResults.faces.map((face: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="font-medium">บุคคลที่ {face.id}</span>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">{face.gender}, {face.age} ปี</div>
                        <div className="text-xs text-gray-500">ความแม่นยำ: {(face.confidence * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'document':
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">สรุปเอกสาร</h4>
              <p className="text-green-800">{analysisResults.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <h4 className="font-medium text-gray-900 mb-3">หน่วยงานที่สกัดได้</h4>
                <div className="space-y-2">
                  {analysisResults.entities.map((entity: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{entity.text}</span>
                        <div className="text-xs text-gray-500">{entity.type}</div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {(entity.confidence * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h4 className="font-medium text-gray-900 mb-3">การวิเคราะห์เพิ่มเติม</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-700">ความรู้สึก:</span>
                    <span className="ml-2 text-sm text-gray-600">{analysisResults.sentiment.label}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">คำสำคัญ:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {analysisResults.keywords.map((keyword: string, index: number) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'cdr':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card text-center">
                <div className="text-2xl font-bold text-police-600">{analysisResults.totalRecords}</div>
                <div className="text-sm text-gray-600">บันทึกทั้งหมด</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-police-600">{analysisResults.uniqueNumbers}</div>
                <div className="text-sm text-gray-600">หมายเลขโทรศัพท์</div>
              </div>
              <div className="card text-center">
                <div className="text-sm font-medium text-gray-900">{analysisResults.timeRange}</div>
                <div className="text-sm text-gray-600">ช่วงเวลา</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <h4 className="font-medium text-gray-900 mb-3">หมายเลขที่ติดต่อบ่อย</h4>
                <div className="space-y-2">
                  {analysisResults.topContacts.map((contact: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="font-mono text-sm">{contact.number}</span>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">{contact.calls} สาย</div>
                        <div className="text-xs text-gray-500">{Math.floor(contact.duration / 60)} นาที</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h4 className="font-medium text-gray-900 mb-3">รูปแบบที่พบ</h4>
                <div className="space-y-2">
                  {analysisResults.patterns.map((pattern: string, index: number) => (
                    <div key={index} className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                      {pattern}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">การวิเคราะห์ข้อมูลและหลักฐาน</h1>
          <p className="text-gray-600 mt-1">
            วิเคราะห์หลักฐานด้วยปัญญาประดิษฐ์เพื่อสกัดข้อมูลสำคัญ
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-500">เลือกประเภทการวิเคราะห์</span>
        </div>
      </div>

      {/* Module Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {analysisModules.map((module) => (
          <div
            key={module.id}
            className={`card cursor-pointer transition-all duration-200 ${
              selectedModule === module.id
                ? 'ring-2 ring-police-500 bg-police-50'
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedModule(module.id)}
          >
            <div className="flex items-center mb-3">
              <module.icon className={`h-8 w-8 mr-3 ${
                selectedModule === module.id ? 'text-police-600' : 'text-gray-400'
              }`} />
              <h3 className="font-semibold text-gray-900">{module.title}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">{module.description}</p>
            <div className="space-y-1">
              {module.features.slice(0, 3).map((feature, index) => (
                <div key={index} className="flex items-center text-xs text-gray-500">
                  <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Analysis Interface */}
      {currentModule && (
        <div className="card">
          <div className="flex items-center mb-6">
            <currentModule.icon className="h-6 w-6 text-police-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">{currentModule.title}</h2>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <FileUpload
              onFilesSelected={handleFilesSelected}
              acceptedFileTypes={currentModule.acceptedTypes}
              maxFileSize={currentModule.maxSize}
              uploadProgress={uploadProgress}
              onRemoveFile={handleRemoveFile}
            />
          </div>

          {/* Analysis Controls */}
          {uploadedFiles.length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium text-gray-900">พร้อมสำหรับการวิเคราะห์</h4>
                  <p className="text-sm text-gray-600">
                    ไฟล์ที่เลือก: {uploadedFiles.length} ไฟล์
                  </p>
                </div>
                <button
                  onClick={handleStartAnalysis}
                  disabled={isAnalyzing}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center">
                      <LoadingSpinner size="sm" color="white" className="mr-2" />
                      กำลังวิเคราะห์...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <ChartBarIcon className="h-4 w-4 mr-2" />
                      เริ่มการวิเคราะห์
                    </div>
                  )}
                </button>
              </div>

              {isAnalyzing && (
                <ProgressBar
                  progress={analysisProgress}
                  label="ความคืบหน้าการวิเคราะห์"
                  showPercentage
                  color="primary"
                />
              )}
            </div>
          )}

          {/* Analysis Results */}
          {analysisResults && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center mb-4">
                <EyeIcon className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">ผลการวิเคราะห์</h3>
              </div>
              {renderResults()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Analysis;