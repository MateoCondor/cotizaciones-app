"use server";

import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { cotizacionSchema, CotizacionFormData } from "@/lib/validations/cotizacion";
import { revalidatePath } from "next/cache";

// Función para calcular totales de forma segura en el backend
const calcularTotales = (items: CotizacionFormData["items"]) => {
  let subtotal = 0;
  let descuentoTotal = 0;
  let ivaTotal = 0;
  let total = 0;

  const itemsCalculados = items.map((item, index) => {
    const itemSubtotalBruto = item.cantidad * item.precioUnitario;
    
    // Calcular descuento por item
    let itemDescuentoValor = 0;
    if (item.tipoDescuento === "PORCENTAJE") {
      itemDescuentoValor = itemSubtotalBruto * (item.descuento / 100);
    } else {
      itemDescuentoValor = item.descuento;
    }
    
    const itemSubtotalNeto = itemSubtotalBruto - itemDescuentoValor;
    
    // Calcular IVA
    const itemIvaValor = itemSubtotalNeto * (item.iva / 100);

    // Sumar a globales
    subtotal += itemSubtotalBruto;
    descuentoTotal += itemDescuentoValor;
    ivaTotal += itemIvaValor;
    total += (itemSubtotalNeto + itemIvaValor);

    return {
      ...item,
      subtotalNetoCalculado: itemSubtotalNeto,
      orden: index
    };
  });

  return { subtotal, descuentoTotal, ivaTotal, total, itemsCalculados };
};

export async function saveCotizacion(data: CotizacionFormData) {
  const session = await auth();
  if (!session) return { error: "No autorizado", success: false };

  const validated = cotizacionSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues.map((e) => e.message).join(", "), success: false };
  }

  const { subtotal, descuentoTotal, ivaTotal, total, itemsCalculados } = calcularTotales(validated.data.items);

  try {
    const result = await db.$transaction(async (prisma) => {
      let finalNumero = validated.data.numero;

      if (!data.id) {
        // Generar Correlativo COT-YYYY-NNNN
        const year = new Date().getFullYear();
        const currentCount = await prisma.cotizacion.count({
          where: { numero: { startsWith: `COT-${year}-` } }
        });
        finalNumero = `COT-${year}-${String(currentCount + 1).padStart(4, '0')}`;
      }

      const cotizacionData = {
        fechaEmision: validated.data.fechaEmision,
        fechaVencimiento: validated.data.fechaVencimiento,
        estado: validated.data.estado,
        clienteId: validated.data.clienteId,
        condicionesPago: validated.data.condicionesPago,
        plazoEntrega: validated.data.plazoEntrega,
        observaciones: validated.data.observaciones,
        subtotal,
        descuentoTotal,
        ivaTotal,
        total,
      };

      if (data.id) {
        // Actualizar Cabecera
        const updatedCotizacion = await prisma.cotizacion.update({
          where: { id: data.id },
          data: cotizacionData,
        });

        // Eliminar items antiguos y recrearlos (estrategia simple y robusta)
        await prisma.itemCotizacion.deleteMany({
          where: { cotizacionId: data.id }
        });

        await prisma.itemCotizacion.createMany({
          data: itemsCalculados.map(item => ({
            cotizacionId: data.id as string,
            productoId: item.productoId,
            nombre: item.nombre,
            descripcion: item.descripcion,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            descuento: item.descuento,
            tipoDescuento: item.tipoDescuento,
            iva: item.iva,
            subtotal: item.subtotalNetoCalculado,
            orden: item.orden
          }))
        });

        return updatedCotizacion;
      } else {
        // Crear nueva cotización con items (nested write)
        const newCotizacion = await prisma.cotizacion.create({
          data: {
            ...cotizacionData,
            numero: finalNumero as string,
            items: {
              create: itemsCalculados.map(item => ({
                productoId: item.productoId,
                nombre: item.nombre,
                descripcion: item.descripcion,
                cantidad: item.cantidad,
                precioUnitario: item.precioUnitario,
                descuento: item.descuento,
                tipoDescuento: item.tipoDescuento,
                iva: item.iva,
                subtotal: item.subtotalNetoCalculado,
                orden: item.orden
              }))
            }
          }
        });
        return newCotizacion;
      }
    });

    revalidatePath("/cotizaciones");
    return { error: null, success: true, cotizacionId: result.id };
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2002') {
      return { error: "Error de número correlativo duplicado. Intente nuevamente.", success: false };
    }
    return { error: "Error interno del servidor guardando la cotización", success: false };
  }
}

export async function changeCotizacionState(id: string, nuevoEstado: string) {
  const session = await auth();
  if (!session) return { error: "No autorizado", success: false };

  try {
    await db.cotizacion.update({
      where: { id },
      data: { estado: nuevoEstado as any },
    });
    revalidatePath("/cotizaciones");
    return { error: null, success: true };
  } catch (error) {
    return { error: "Error al cambiar estado", success: false };
  }
}
