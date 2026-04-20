'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Upload,
  Video,
  Image,
  Music,
  Trash2,
  Check,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface StyleReference {
  _id: string;
  fileName: string;
  fileType: 'video' | 'image' | 'audio';
  fileSize?: number;
  fileUrl?: string;
  analysisStatus: 'pending' | 'analyzing' | 'completed' | 'failed';
  createdAt?: string;
}

interface ContentProject {
  _id: string;
  name: string;
  description: string;
  status: string;
  referenceCount: number;
  settings: {
    aspectRatio: string;
    videoDuration: number;
  };
}

export default function UploadReferencesPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string;
  
  const [project, setProject] = useState<ContentProject | null>(null);
  const [references, setReferences] = useState<StyleReference[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchReferences();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/factory/projects/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  const fetchReferences = async () => {
    try {
      const response = await fetch(`/api/factory/projects/${projectId}/references`);
      if (response.ok) {
        const data = await response.json();
        setReferences(data.references || []);
      }
    } catch (error) {
      console.error('Error fetching references:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadedFiles: StyleReference[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        let fileType: 'video' | 'image' | 'audio' = 'video';
        if (file.type.startsWith('image/')) fileType = 'image';
        else if (file.type.startsWith('audio/')) fileType = 'audio';

        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        const response = await fetch(`/api/factory/projects/${projectId}/references`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: file.name,
            fileType,
            fileSize: file.size,
            fileUrl: base64,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          uploadedFiles.push(data.reference);
        }

        setUploadProgress(((i + 1) / files.length) * 100);
      }

      setReferences(prev => [...prev, ...uploadedFiles]);
      fetchProject();
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Ошибка при загрузке файлов');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAnalyzeReferences = async () => {
    setAnalyzing(true);
    
    try {
      const response = await fetch(`/api/factory/projects/${projectId}/analyze`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchReferences();
        alert('Анализ завершен! Профиль стиля создан.');
        router.push(`/ai-studio/${projectId}/generate`);
      }
    } catch (error) {
      console.error('Error analyzing references:', error);
      alert('Ошибка при анализе');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDeleteReference = async (referenceId: string) => {
    try {
      const response = await fetch(`/api/factory/projects/${projectId}/references/${referenceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setReferences(prev => prev.filter(r => r._id !== referenceId));
      }
    } catch (error) {
      console.error('Error deleting reference:', error);
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'image':
        return <Image className="w-5 h-5" />;
      case 'audio':
        return <Music className="w-5 h-5" />;
      default:
        return <Video className="w-5 h-5" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '-';
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm">секундочку...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex-1 p-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">Референсы</h1>
        <p className="text-muted-foreground">
          Загрузите видео, изображения или аудио для анализа стиля
        </p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Загрузить файлы
          </CardTitle>
          <CardDescription>
            Видео (.mp4, .mov), изображения (.jpg, .png) или аудио (.mp3, .wav)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">
              Перетащите файлы сюда или нажмите для выбора
            </p>
            <p className="text-sm text-muted-foreground">
              Максимальный размер: 100 МБ на файл
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,image/*,audio/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />

          {uploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-sm text-center text-muted-foreground">
                Загрузка... {Math.round(uploadProgress)}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* References List */}
      {references.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Загруженные файлы ({references.length})</span>
              <div className="flex gap-2">
                {references.length > 0 && (
                  <Button
                    onClick={handleAnalyzeReferences}
                    disabled={analyzing}
                    className="gap-2"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Анализ...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Анализировать стиль
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {references.map((ref) => (
                <div
                  key={ref._id}
                  className="relative group rounded-lg border p-4 space-y-3 hover:border-primary/50 transition-colors"
                >
                  <button
                    onClick={() => handleDeleteReference(ref._id)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      {getFileIcon(ref.fileType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{ref.fileName}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(ref.fileSize || 0)}
                      </p>
                    </div>
                  </div>

                  {/* Analysis Status */}
                  <div className="flex items-center gap-2 text-sm">
                    {ref.analysisStatus === 'completed' && (
                      <>
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-green-500">Анализ завершен</span>
                      </>
                    )}
                    {ref.analysisStatus === 'analyzing' && (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />
                        <span className="text-yellow-500">Анализ...</span>
                      </>
                    )}
                    {ref.analysisStatus === 'pending' && (
                      <>
                        <div className="w-4 h-4 rounded-full bg-muted" />
                        <span className="text-muted-foreground">Ожидает анализа</span>
                      </>
                    )}
                    {ref.analysisStatus === 'failed' && (
                      <>
                        <div className="w-4 h-4 rounded-full bg-red-500" />
                        <span className="text-red-500">Ошибка анализа</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {references.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <Upload className="w-16 h-16 text-muted-foreground/50" />
            <div className="text-center">
              <p className="text-lg font-medium mb-2">Нет референсов</p>
              <p className="text-sm text-muted-foreground mb-4">
                Загрузите видео, изображения или аудио для анализа стиля вашего бренда
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      {references.length > 0 && !analyzing && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  {references.length >= 10 ? 'Готово к анализу!' : 'Загрузите ещё файлов'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Загружено {references.length} файлов. 
                  {references.length >= 10 
                    ? ' AI создаст профиль стиля вашего бренда.'
                    : ' Для лучшего результата рекомендуется 10+ файлов.'}
                </p>
              </div>
              <div className="flex gap-2">
                {references.length > 0 && (
                  <Button
                    onClick={handleAnalyzeReferences}
                    size="lg"
                    className="gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    Начать анализ
                  </Button>
                )}
                <Button
                  onClick={() => router.push(`/ai-studio/${projectId}/generate`)}
                  size="lg"
                  variant="outline"
                  className="gap-2"
                >
                  Перейти к генерации →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
