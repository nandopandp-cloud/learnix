"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Save } from "lucide-react";

import { upsertCourse, type FormState } from "../actions";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import {
  TextInput,
  TextArea,
  Select,
  Checkbox,
  FormMessage,
} from "@/components/ui/form-controls";
import type { Category, Instructor, Course } from "@/db/schema";

const LEVELS = [
  "Iniciante",
  "Intermediário",
  "Avançado",
  "Iniciante ao Avançado",
];

function SubmitButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" shimmer disabled={pending}>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Save className="h-4 w-4" />
      )}
      {isNew ? "Criar curso" : "Salvar alterações"}
    </Button>
  );
}

export function CourseForm({
  course,
  categories,
  instructors,
}: {
  course?: Course;
  categories: Category[];
  instructors: Instructor[];
}) {
  const [state, formAction] = useActionState<FormState, FormData>(
    upsertCourse,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-6">
      {course && <input type="hidden" name="id" value={course.id} />}

      <section className="rounded-xl bg-surface-1 p-5 ring-1 ring-white/[0.07]">
        <h2 className="mb-4 font-display text-[1.05rem] font-semibold text-white">
          Informações básicas
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="Título"
            name="title"
            defaultValue={course?.title}
            placeholder="Design System na Prática"
            required
            className="sm:col-span-2"
          />
          <TextInput
            label="Slug"
            name="slug"
            defaultValue={course?.slug}
            placeholder="deixe vazio para gerar do título"
            hint="Usado na URL do curso."
            className="sm:col-span-2"
          />
          <TextArea
            label="Chamada"
            name="tagline"
            defaultValue={course?.tagline ?? ""}
            rows={2}
            placeholder="Uma frase que resume a promessa do curso."
            className="sm:col-span-2"
          />
          <TextArea
            label="Descrição"
            name="description"
            defaultValue={course?.description ?? ""}
            rows={5}
            placeholder="Descreva o curso em detalhes."
            className="sm:col-span-2"
          />
        </div>
      </section>

      <section className="rounded-xl bg-surface-1 p-5 ring-1 ring-white/[0.07]">
        <h2 className="mb-4 font-display text-[1.05rem] font-semibold text-white">
          Classificação
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Categoria"
            name="categoryId"
            defaultValue={course?.categoryId ?? ""}
          >
            <option value="">Sem categoria</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>

          <Select
            label="Instrutor"
            name="instructorId"
            defaultValue={course?.instructorId ?? ""}
          >
            <option value="">Sem instrutor</option>
            {instructors.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.name}
              </option>
            ))}
          </Select>

          <Select label="Nível" name="level" defaultValue={course?.level}>
            {LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </Select>

          <TextInput
            label="Idioma"
            name="language"
            defaultValue={course?.language ?? "Português"}
          />
        </div>
      </section>

      <section className="rounded-xl bg-surface-1 p-5 ring-1 ring-white/[0.07]">
        <h2 className="mb-4 font-display text-[1.05rem] font-semibold text-white">
          Mídia e conteúdo
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <FileUpload
            label="Thumbnail"
            kind="image"
            name="thumbnailUrl"
            defaultValue={course?.thumbnailUrl}
            hint="Imagem 16:9 usada nos cards."
          />
          <FileUpload
            label="Backdrop"
            kind="image"
            name="backdropUrl"
            defaultValue={course?.backdropUrl}
            hint="Imagem larga do topo da página do curso."
          />
          <TextArea
            label="Você vai aprender"
            name="learningPoints"
            defaultValue={course?.learningPoints?.join("\n") ?? ""}
            rows={6}
            placeholder={"Um item por linha"}
            hint="Um tópico por linha."
            className="sm:col-span-2"
          />
          <TextInput
            label="Quantidade de materiais"
            name="resourceCount"
            type="number"
            min={0}
            defaultValue={course?.resourceCount ?? 0}
          />
          <TextInput
            label="Atualizado em"
            name="updatedLabel"
            defaultValue={course?.updatedLabel ?? ""}
            placeholder="Abril/2024"
          />
        </div>
      </section>

      <section className="rounded-xl bg-surface-1 p-5 ring-1 ring-white/[0.07]">
        <h2 className="mb-3 font-display text-[1.05rem] font-semibold text-white">
          Publicação
        </h2>

        <div className="space-y-1">
          <Checkbox
            label="Publicado"
            description="Cursos não publicados ficam ocultos no catálogo."
            name="isPublished"
            defaultChecked={course?.isPublished ?? true}
          />
          <Checkbox
            label="Premium"
            description="Exige assinatura para acessar todas as aulas."
            name="isPremium"
            defaultChecked={course?.isPremium ?? false}
          />
          <Checkbox
            label="Novo lançamento"
            description="Exibe o selo NOVO e entra na fileira de lançamentos."
            name="isNew"
            defaultChecked={course?.isNew ?? false}
          />
        </div>
      </section>

      <FormMessage error={state?.error} success={state?.success} />

      <div className="flex justify-end">
        <SubmitButton isNew={!course} />
      </div>
    </form>
  );
}
